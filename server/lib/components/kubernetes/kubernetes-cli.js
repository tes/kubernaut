import { spawn, } from 'child_process';

export default function(options = {}) {

  function start(cb) {

    function apply(manifest, logger) {
      return new Promise((resolve, reject) => {
        const kubectl = spawn('kubectl', ['apply', '-f', '-',]);
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

    return cb(null, {
      apply,
    });
  }

  return {
    start,
  };
}
