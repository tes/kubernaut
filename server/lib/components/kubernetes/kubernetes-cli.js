import { spawn, } from 'child_process';

export default function(options = {}) {

  function start(cb) {

    function apply(context, manifest, logger) {
      return new Promise((resolve, reject) => {
        const kubectl = spawn('kubectl', ['--context', context, 'apply', '--filename', '-',]);
        kubectl.stdout.on('data', data => {
          logger.info(data.toString().trim());
        });
        kubectl.stderr.on('data', data => {
          logger.error(data.toString().trim());
        });
        kubectl.on('close', (code) => {
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

    function checkDeployment(context, name, logger) {
      return check(['--context', context, 'get', 'deployment', name,], logger);
    }

    function rolloutStatus(context, name, logger) {
      return check(['--context', context, 'rollout', 'status', `deployments/${name}`,], logger);
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
      checkDeployment,
      rolloutStatus,
    });
  }

  return {
    start,
  };
}
