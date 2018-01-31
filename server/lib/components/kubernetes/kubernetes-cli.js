import { spawn, } from 'child_process';

export default function(options = {}) {

  function start(cb) {

    function apply(context, namespace, manifest, emitter, ) {
      return new Promise(async (resolve, reject) => {
        const args = ['--context', context, '--namespace', namespace, 'apply', '--filename', '-',];
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


    function rolloutStatus(context, namespace, name, emitter) {
      return new Promise(async (resolve, reject) => {
        const args = ['--context', context, '--namespace', namespace, 'rollout', 'status', `deployments/${name}`,];
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

    function checkContext(context, logger) {
      return check(['config', 'get-contexts', context,], logger);
    }

    function checkCluster(context, logger) {
      return check(['--context', context, 'cluster-info',], logger);
    }

    function checkNamespace(context, namespace, logger) {
      return check(['--context', context, 'get', 'namespace', namespace,], logger);
    }

    function checkDeployment(context, namespace, name, logger) {
      return check(['--context', context, '--namespace', namespace, 'get', 'deployment', name,], logger);
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
