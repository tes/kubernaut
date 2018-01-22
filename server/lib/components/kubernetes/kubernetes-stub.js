import { safeLoadAll, } from 'js-yaml';

export default function(options = {}) {

  function defaultContexts() {
    return {
      test: {
        cluster: true,
        namespaces: {
          'default': {
            manifests: [],
            deployments: [],
          },
          'other': {
            manifests: [],
            deployments: [],
          },
        },
      },
      xcluster: {
        cluster: false,
        namespaces: {},
      },
    };
  }

  function start({ contexts = defaultContexts(), }, cb) {

    function apply(deployment) {
      const context = deployment.namespace.cluster.context;
      const namespace = deployment.namespace.name;
      const manifest = deployment.manifest.yaml;
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        if (!contexts[context].namespaces[namespace]) return reject(new Error(`Unknown namespace: ${namespace}`));
        contexts[context].namespaces[namespace].manifests.push(safeLoadAll(manifest));
        resolve();
      });
    }

    function checkContext(context) {
      return new Promise((resolve) => {
        resolve(Object.keys(contexts).includes(context));
      });
    }

    function checkCluster(context) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        resolve(contexts[context].cluster);
      });
    }

    function checkNamespace(context, namespace) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        resolve(Object.keys(contexts[context].namespaces).includes(namespace));
      });
    }

    function checkDeployment(context, namespace, name) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        if (!contexts[context].namespaces[namespace]) return reject(new Error(`Unknown namespace: ${namespace}`));
        resolve(!!contexts[context].namespaces[namespace].deployments.find(d => d.name === name));
      });
    }

    function rolloutStatus(context, namespace, name) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        if (!contexts[context].namespaces[namespace]) return reject(new Error(`Unknown namespace: ${namespace}`));

        const deployment = contexts[context].namespaces[namespace].deployments.find(d => d.name === name);
        if (!deployment) return reject(new Error(`Unknown deployment: ${name}`));

        resolve(deployment.status === 'success');
      });
    }

    function getContexts() {
      return contexts;
    }

    async function nuke() {
      contexts = defaultContexts();
    }

    return cb(null, {
      apply,
      checkContext,
      checkCluster,
      checkDeployment,
      checkNamespace,
      rolloutStatus,
      getContexts,
      nuke,
    });
  }

  return {
    start,
  };
}
