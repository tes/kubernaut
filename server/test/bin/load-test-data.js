import createSystem from '../../lib/system';
import Chance from 'chance';
import { makeRelease, makeMeta } from '../factories';
import pLimit from 'p-limit';

const limit = pLimit(50);
const chance = new Chance();

process.env.APP_ENV = 'local';

const system = createSystem()
  .remove('server')
  .start(async (err, dependencies) => {
      if (err) throw err;
      const { store, postgres } = dependencies

      try {
        await store.unlogged();
        await store.nuke();

        // Iterate services inside versions, as creating a release locks based on service name
        const releases = [];
        for (var v = 0; v < 100; v++) {
          for (var s = 0; s < 100; s++) {
            const name = `${chance.word()}-${chance.word()}`
            const data = makeRelease({ service: { name }, version: `${v}` })
            const meta = makeMeta()
            releases.push(limit(() => {
              return store.saveRelease(data, meta)
            }))
          }
        }
        await Promise.all(releases);

        await postgres.query('ANALYZE');
      } finally {
        await store.logged();
      }

      process.exit(0);
  })


setInterval(() => {}, Number.MAX_VALUE)
