import { safeLoadAll } from 'js-yaml';
import path from 'path';
import fs from 'fs';
import os from 'os';

export default function(options = {}) {

  let timeoutId;

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

  function start({ contexts = defaultContexts() }, cb) {

    function apply(config, context, namespace, manifest, emitter) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        if (!contexts[context].namespaces[namespace]) return reject(new Error(`Unknown namespace: ${namespace}`));

        const manifestJson = safeLoadAll(manifest);
        emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdin', content: `kubectl --context ${context} --namespace ${namespace} apply -f \${MANIFEST}\n` });

        const name = manifestJson[2].metadata.name;

        if (/^z-/.test(name)) return resolve(99);

        contexts[context].namespaces[namespace].manifests.push(manifestJson);

        const status = /^x-/.test(name) ? 'failure' : 'success';
        contexts[context].namespaces[namespace].deployments.push({ name, status });
        resolve(0);
      });
    }

    function checkConfig(config, logger) {
      const fullPath = path.resolve(os.homedir(), config);
      return new Promise((resolve, reject) => {
        fs.access(fullPath, fs.constants.R_OK, (err) => {
          return err ? resolve(false) : resolve(true);
        });
      });
    }

    function checkContext(config, context) {
      return new Promise((resolve) => {
        resolve(Object.keys(contexts).includes(context));
      });
    }

    function checkCluster(config) {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }

    function checkNamespace(config, context, namespace) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        resolve(Object.keys(contexts[context].namespaces).includes(namespace));
      });
    }

    function checkDeployment(config, context, namespace, name) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        if (!contexts[context].namespaces[namespace]) return reject(new Error(`Unknown namespace: ${namespace}`));
        resolve(!!contexts[context].namespaces[namespace].deployments.find(d => d.name === name));
      });
    }

    function rolloutStatus(config, context, namespace, name, emitter) {
      return new Promise((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdin', content: `kubectl --context ${context} --namespace ${namespace} rollout status deployments/${name}\n` });

          if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
          if (!contexts[context].namespaces[namespace]) return reject(new Error(`Unknown namespace: ${namespace}`));

          const deployment = contexts[context].namespaces[namespace].deployments.find(d => d.name === name);
          if (!deployment) return reject(new Error(`Unknown deployment: ${name}`));

          if (deployment.status === 'success') {
            emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdout', content: `super smashing great\n` });
            return resolve(0);
          } else {
            emitter.emit('error', { writtenOn: new Date(), writtenTo: 'stderr', content: `booo\n` });
            return resolve(99);
          }
        }, 500);
      });
    }

    function getContexts() {
      return contexts;
    }

    async function nuke() {
      clearTimeout(timeoutId);
      contexts = defaultContexts();
    }

    return cb(null, {
      apply,
      checkConfig,
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
