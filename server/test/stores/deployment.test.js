import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeRelease, makeMeta, } from '../factories';

describe('Deployment Store', () => {

  const suites = [
    {
      name: 'Memory',
      system: createSystem()
        .remove('server'),
    },
    {
      name: 'Postgres',
      system: createSystem()
        .remove('server')
        .remove('store.release')
        .remove('store.deployment')
        .include(postgres),
    },
  ];

  suites.forEach(suite => {

    describe(`${suite.name} Store`, () => {

      let system = { stop: cb => cb(), };
      let store = { nuke: new Promise(cb => cb()), };

      beforeAll(cb => {
        system = suite.system.start((err, components) => {
          if (err) return cb(err);
          store = components.store;
          cb();
        });
      });

      beforeEach(async cb => {
        store.nuke().then(cb);
      });

      afterAll(cb => {
        store.nuke().then(() => {
          system.stop(cb);
        }).catch(cb);
      });

      describe('Save deployment', () => {
        it('should create a deployment', async (done) => {
          const release = makeRelease();
          const meta = makeMeta();
          const existingRelease = await store.saveRelease(release, meta);

          const context = 'deployment';
          const saved = await store.saveDeployment(existingRelease, {context,}, meta);
          const deployment = await store.getDeployment(saved.id);

          expect(deployment).toBeDefined();
          expect(deployment.id).toBe(saved.id);
          expect(deployment.release).toBe(existingRelease.id);
          expect(deployment.context).toBe(context);
          expect(deployment.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(deployment.createdBy).toBe(meta.user);

          done();
        });
      });
    });
  });
});
