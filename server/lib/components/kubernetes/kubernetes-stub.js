import { safeLoadAll, } from 'js-yaml';

export default function(options = {}) {

  function defaultContexts() {
    return {
      test: {
        namespaces: {
          'default': {
            manifests: [],
            deployments: [],
          },
        },
      },
    };
  }

  function start({ contexts = defaultContexts(), }, cb) {

    function apply(context, namespace, manifest) {
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
