import { safeLoadAll, } from 'js-yaml';

export default function(options = {}) {

  const defautContexts = {
    test: {
      manifests: [],
      deployments: [],
    },
  };

  function start({ contexts = defautContexts, }, cb) {

    function apply(context, manifest) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        contexts[context].manifests.push(safeLoadAll(manifest));
        resolve();
      });
    }

    function checkContext(context) {
      return new Promise((resolve) => {
        resolve(Object.keys(contexts).includes(context));
      });
    }

    function checkDeployment(context, deployment) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        resolve(!!contexts[context].deployments.find(d => d.name === deployment));
      });
    }

    function rolloutStatus(context, name) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));

        const deployment = contexts[context].deployments.find(d => d.name === name);
        if (!deployment) return reject(new Error(`Unknown deployment: ${name}`));

        resolve(deployment.status === 'success');
      });
    }

    return cb(null, {
      apply,
      checkContext,
      checkDeployment,
      rolloutStatus,
    });
  }

  return {
    start,
  };
}
