import { safeDump } from 'js-yaml';
import shortHash from 'short-hash';

export const shortNameGenerator = (jobName = '') => `${jobName.toLowerCase().substring(0, 10)}-${shortHash(jobName)}`;

export function generateJobSecretYaml(jobVersion, secretData) {
  const doc = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: `cronjob-${shortNameGenerator(jobVersion.job.name)}`,
    },
    type: 'Opaque',
    data: secretData.reduce((acc, secret) => {
      return {
        ...acc,
        [secret.key]: secret.value,
      };
    }, {}),
  };

  return safeDump(doc, { lineWidth: 120 });
}
