import { spawn, } from 'child_process';
import DeploymentLogEntry from '../../domain/DeploymentLogEntry';

export default function(options = {}) {

  function start({ store, }, cb) {

    function apply(deployment) {
      const context = deployment.context;
      const namespace = deployment.namespace.name;
      const manifest = deployment.manifest.yaml;
      return new Promise(async (resolve, reject) => {
        const args = ['--context', context, '--namespace', namespace, 'apply', '--filename', '-',];
        const entry = new DeploymentLogEntry({ deployment, writtenOn: new Date(), writtenTo: 'stdin', content: `kubectl ${args.join(' ')} \${KUBERNETES_MANIFEST}`, });
        await store.saveDeploymentLogEntry(entry);
        const kubectl = spawn('kubectl', args);
        kubectl.stdout.on('data', async data => {
          const entry = new DeploymentLogEntry({ deployment, writtenOn: new Date(), writtenTo: 'stdout', content: data.toString().trim(), });
          await store.saveDeploymentLogEntry(entry);
        });
        kubectl.stderr.on('data', async data => {
          const entry = new DeploymentLogEntry({ deployment, writtenOn: new Date(), writtenTo: 'stderr', content: data.toString().trim(), });
          await store.saveDeploymentLogEntry(entry);
        });
        kubectl.on('close', code => {
          return code === 0 ? resolve() : reject(new Error(`kubectl apply exited with code ${code}`));
        });
        kubectl.on('error', reject);
        kubectl.stdin.write(manifest);
        kubectl.stdin.end();
      });
    }

    function checkContext(context, logger) {
      return check(['config', 'get-contexts', context,], logger);
    }

    function checkNamespace(context, namespace, logger) {
      return check(['--context', context, 'get', 'namespace', namespace,], logger);
    }

    function checkDeployment(context, namespace, name, logger) {
      return check(['--context', context, '--namespace', namespace, 'get', 'deployment', name,], logger);
    }

    function rolloutStatus(context, namespace, name, logger) {
      return check(['--context', context, '--namespace', namespace, 'rollout', 'status', `deployments/${name}`,], logger);
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
      checkNamespace,
      checkDeployment,
      rolloutStatus,
    });
  }

  return {
    start,
  };
}
