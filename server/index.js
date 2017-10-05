process.env.APP_ENV = process.env.APP_ENV || 'local';
import system from './lib/system';
import runner from 'systemic-domain-runner';

runner(system(), { logger: console, }).start((err, dependencies) => {
    if (err) die('Error starting system', err);
    dependencies.logger.info(`${dependencies.pkg.name} has started`);
});

function die(message, err) {
    console.error(err, message); // eslint-disable-line no-console
    process.exit(1);
}
