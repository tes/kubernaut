import { spawn, } from 'child_process';

export default function(options = {}) {

  function start(cb) {

    function apply(context, manifest, logger) {
      return new Promise((resolve, reject) => {
        const kubectl = spawn('kubectl', ['apply', '--context', context, '--filename', '-',]);
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
      return new Promise((resolve, reject) => {
        const kubectl = spawn('kubectl', ['get-contexts', context,]);
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
    });
  }

  return {
    start,
  };
}
