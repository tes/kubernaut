import { spawn, } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export default function(options = {}) {

  function start(cb) {

    function apply(config, context, namespace, manifest, emitter, ) {
      return new Promise(async (resolve, reject) => {
        const args = ['--kubeconfig', config, '--context', context, '--namespace', namespace, 'apply', '--filename', '-',];
        emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdin', content: `kubectl ${args.join(' ')} \${KUBERNETES_MANIFEST}`, });

        const kubectl = spawn('kubectl', args);
        kubectl.stdout.on('data', async data => {
          emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdout', content: data.toString().trim(), });
        });
        kubectl.stderr.on('data', async data => {
          emitter.emit('error', { writtenOn: new Date(), writtenTo: 'stderr', content: data.toString().trim(), });
        });
        kubectl.on('close', code => {
          resolve(code);
        });
        kubectl.on('error', reject);
        kubectl.stdin.write(manifest);
        kubectl.stdin.end();
      });
    }

    function rolloutStatus(config, context, namespace, name, emitter) {
      return new Promise(async (resolve, reject) => {
        const args = ['--kubeconfig', config, '--context', context, '--namespace', namespace, 'rollout', 'status', `deployments/${name}`,];
        emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdin', content: `kubectl ${args.join(' ')}`, });

        const kubectl = spawn('kubectl', args);
        kubectl.stdout.on('data', async data => {
          emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdout', content: data.toString().trim(), });
        });
        kubectl.stderr.on('data', async data => {
          emitter.emit('error', { writtenOn: new Date(), writtenTo: 'stderr', content: data.toString().trim(), });
        });
        kubectl.on('close', code => {
          resolve(code);
        });
        kubectl.on('error', reject);
        kubectl.stdin.end();
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

    function checkContext(config, context, logger) {
      return check(['--kubeconfig', config, 'config', 'get-contexts', context, ], logger);
    }

    function checkCluster(config, context, logger) {
      return check(['--kubeconfig', config, '--context', context, 'cluster-info',], logger);
    }

    function checkNamespace(config, context, namespace, logger) {
      return check(['--kubeconfig', config, '--context', context, 'get', 'namespace', namespace,], logger);
    }

    function checkDeployment(config, context, namespace, name, logger) {
      return check(['--kubeconfig', config, '--context', context, '--namespace', namespace, 'get', 'deployment', name,], logger);
    }

    function check(args, logger) {
      return new Promise((resolve, reject) => {
        const kubectl = spawn('kubectl', args);
        kubectl.stdout.on('data', data => {
          logger.info(data.toString().trim());
        });
        kubectl.stderr.on('data', data => {
          logger.error(data.toString().trim());
        });
        kubectl.on('close', (code) => {
          return code === 0 ? resolve(true) : resolve(false);
        });
        kubectl.on('error', reject);
        kubectl.stdin.end();
      });
    }

    return cb(null, {
      apply,
      checkConfig,
      checkContext,
      checkCluster,
      checkNamespace,
      checkDeployment,
      rolloutStatus,
    });
  }

  return {
    start,
  };
}
