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

    function apply(context, namespace, manifest, emitter) {
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

    function rolloutStatus(context, namespace, name, emitter) {
      return new Promise((resolve, reject) => {

        emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdin', content: `kubectl --context ${context} --namespace ${namespace} rollout status deployments/${name}`, });

        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        if (!contexts[context].namespaces[namespace]) return reject(new Error(`Unknown namespace: ${namespace}`));

        const deployment = contexts[context].namespaces[namespace].deployments.find(d => d.name === name);
        if (!deployment) return reject(new Error(`Unknown deployment: ${name}`));

        if (deployment.status === 'success') {
          emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdout', content: `super smashing great`, });
          return resolve(0);
        } else {
          emitter.emit('error', { writtenOn: new Date(), writtenTo: 'stderr', content: `booo`, });
          return resolve(99);
        }
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
