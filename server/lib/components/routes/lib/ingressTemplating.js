import Promise from 'bluebird';
import { safeDump } from 'js-yaml';
import hogan from 'hogan.js';

const acceptedTags = ['_v', '_t'];

export const parseAndValidate = (raw = '', acceptedVariables = []) => {
  const parsed = hogan.parse(hogan.scan(raw));
  if (!parsed.length) {
    throw new Error(`empty.`);
  }

  const hasBannedTags = parsed.filter(({ tag }) => {
    if (!tag) return true;
    return acceptedTags.indexOf(tag) === -1;
  }).length > 0;

  if (hasBannedTags) {
    throw new Error(`Contains invalid templating structure.`);
  }

  const hasExtraVariables = parsed.filter(({ tag }) => (tag === '_v')).filter(({ n }) => {
    if (!n) return true;
    return acceptedVariables.indexOf(n) === -1;
  }).length > 0;

  if (hasExtraVariables) {
    throw new Error(`Contains invalid variables.`);
  }

  return parsed; // Its valid.
};

export const extractTemplateVariables = (raw = '') => {
  const parsed = hogan.parse(hogan.scan(raw));
  return parsed.filter(({ tag }) => (tag === '_v')).map(({ n }) => (n));
};

export async function getIngressManifest(store, ingressVersion, cluster) {
  const entryDocs = await Promise.mapSeries(ingressVersion.entries, async entry => ({
    apiVersion: 'networking.k8s.io/v1beta1',
    kind: 'Ingress',
    metadata: {
      name: entry.name,
      annotations: entry.annotations.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {
        'kubernetes.io/ingress.class': entry.ingressClass.name,
      }),
    },
    spec: {
      rules: await Promise.mapSeries(entry.rules, async rule => {
        const toReturn = {
          http: {
            paths: [
              {
                backend: {
                  serviceName: ingressVersion.service.name,
                  servicePort: parseInt(rule.port, 10),
                },
                path: rule.path,
              }
            ]
          }
        };

        if (rule.customHost) {
          const variableNames = extractTemplateVariables(rule.customHost);
          const variableMap = await Promise.reduce(variableNames, async (acc, name) => {
            if (name === 'service') {
              acc[name] = ingressVersion.service.name;
              return acc;
            }
            const [clusterIngressVariable] = (await store.findClusterIngressVariables({ name, cluster: cluster.id })).items;
            acc[name] = clusterIngressVariable.value;
            return acc;
          }, {});
          toReturn.host = hogan.compile(rule.customHost).render(variableMap);
        } else if (rule.ingressHostKey.id) {
          const [clusterIngressHost] = (await store.findClusterIngressHosts({ cluster: cluster.id, ingressHostKey: rule.ingressHostKey.id })).items;
          toReturn.host = clusterIngressHost.value;
        }

        return toReturn;
      }),
    }
  }));

  return entryDocs.map(doc => safeDump(doc, { lineWidth: 120 })).join('---\n');
}
