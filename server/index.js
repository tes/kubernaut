import system from './lib/system';
import runner from 'systemic-domain-runner';

process.env.APP_ENV = process.env.APP_ENV || 'local';

runner(system(), { logger: console, }).start((err, dependencies) => {
  if (err) die('Error starting system', err);
  dependencies.logger.info(`${dependencies.pkg.name} has started in ${process.env.APP_ENV}`);
});

function die(message, err) {
  console.error(err, message); // eslint-disable-line no-console
  process.exit(1);
}
