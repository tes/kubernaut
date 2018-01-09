import createSystem from '../../lib/system';
import Chance from 'chance';
import { makeAccount, makeDeployment, makeDeploymentLogEntry, makeMeta, makeRootMeta, } from '../factories';
import pLimit from 'p-limit';

const limit = pLimit(50);
const chance = new Chance();

process.env.APP_ENV = 'local';

createSystem()
  .remove('server')
  .start(async (err, dependencies) => {
      if (err) throw err;
      const { store, postgres, } = dependencies;

      try {
        await store.unlogged();
        await store.nuke();

        const account = await store.saveAccount(makeAccount(), makeRootMeta());

        // Iterate services inside versions, as creating a release locks based on service name
        const tasks = [];
        for (let v = 1; v <= 10; v++) {
          for (let s = 0; s < 10; s++) {
            const name = `service-${chance.word()}-${chance.word()}`;
            const commit = chance.hash().substr(0, 6);
            const data = makeDeployment({
              context: 'test',
              release: {
                service: {
                  name,
                },
                version: `${commit}-${v}`,
              },
            });
            const meta = makeMeta({ account, date: new Date(Date.now() - chance.integer({ min: 0, max: 7 * 24 * 60 * 60 * 1000, })), });

            tasks.push(limit(async () => {
              const release = await store.saveRelease(data.release, meta);
              const deployment = await store.saveDeployment({ ...data, release, }, meta);
              const logEntries = [];
              for (let l = 0; l < 5; l++) {
                logEntries.push(makeDeploymentLogEntry({ deployment: deployment, }));
              }
              for (const logEntry of logEntries) {
                await store.saveDeploymentLogEntry(logEntry);
              }
              console.log(`Inserted ${deployment.release.service.name}/${deployment.release.version}/${deployment.id}`); // eslint-disable-line no-console
            }));
          }
        }
        await Promise.all(tasks);

        await postgres.query('ANALYZE');
      } finally {
        await store.logged();
      }

      process.exit(0);
  });


setInterval(() => {}, Number.MAX_VALUE);

