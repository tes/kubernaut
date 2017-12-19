import { safeLoadAll, } from 'js-yaml';

export default function(options = {}) {

  function defaultContexts() {
    return {
      test: {
        manifests: [],
        deployments: [],
        namespaces: [{
          name: 'default',
        },],
      },
    };
  }

  function start({ contexts = defaultContexts(), }, cb) {

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

    function checkNamespace(context, namespace) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        resolve(!!contexts[context].namespaces.find(n => n.name === namespace));
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

    function getContexts() {
      return contexts;
    }

    async function nuke() {
      contexts = defaultContexts();
    }

    return cb(null, {
      apply,
      checkContext,
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
