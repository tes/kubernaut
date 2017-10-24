import createSystem from '../../lib/system';
import Chance from 'chance';
import { makeRelease, makeMeta } from '../factories';
import pLimit from 'p-limit';

const limit = pLimit(10);
const chance = new Chance();

process.env.APP_ENV = 'local';

const system = createSystem()
  .remove('server')
  .start(async (err, dependencies) => {
      if (err) throw err;
      const { store, postgres } = dependencies
      // await store.nuke();

      const releases = [];
      for (var s = 0; s < 10; s++) {
        const name = `${chance.word()}-${chance.word()}`
        for (var r = 0; r < 10; r++) {
          const data = makeRelease({ service: { name }, version: `${r}` })
          const meta = makeMeta()
          releases.push(limit(() => {
            return store.saveRelease(data, meta)
          }))
        }
      }
      await Promise.all(releases);

      await postgres.query('ANALYZE');

      process.exit(0);
  })


setInterval(() => {}, Number.MAX_VALUE)
