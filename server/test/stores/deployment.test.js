import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeDeployment, makeRelease, makeMeta, } from '../factories';

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

        it('should create a deployment', async () => {
          const release = await store.saveRelease(makeRelease(), makeMeta());

          const data = makeDeployment({ release, });
          const meta = makeMeta();
          const deployment = await store.saveDeployment(data, meta);

          expect(deployment).toBeDefined();
          expect(deployment.id).toBeDefined();
          expect(deployment.createdOn).toBe(meta.date);
          expect(deployment.createdBy).toBe(meta.user);
        });
      });

      describe('Get deployment', () => {

        it('should retrieve deployment by id', async () => {
          const release = await store.saveRelease(makeRelease(), makeMeta());

          const data = makeDeployment({ release, });
          const meta = makeMeta();
          const saved = await store.saveDeployment(data, meta);
          const deployment = await store.getDeployment(saved.id);

          expect(deployment).toBeDefined();
          expect(deployment.id).toBe(saved.id);
          expect(deployment.release.service.id).toBe(saved.release.service.id);
          expect(deployment.release.service.name).toBe(saved.release.service.name);
          expect(deployment.release.version).toBe(saved.release.version);
          expect(deployment.release.template.id).toBe(saved.release.template.id);
          expect(deployment.release.template.source).toBe(saved.release.template.source);
          expect(deployment.release.template.checksum).toBe(saved.release.template.checksum);
          expect(deployment.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(deployment.createdBy).toBe(meta.user);
        });

        it('should return undefined when release not found', async () => {
          const deployment = await store.getDeployment('missing');
          expect(deployment).toBe(undefined);
        });
      });

    });
  });
});
