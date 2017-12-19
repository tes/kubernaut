import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeAccount, makeDeployment, makeRelease, makeMeta, } from '../factories';

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
        .set('config.overrides', {
          postgres: {
            tenant: {
              user: 'deployment_test',
              password: 'password',
            },
          },
        })
        .remove('store.release')
        .remove('store.deployment')
        .remove('store.account')
        .include(postgres)
        .remove('server'),
    },
  ];

  suites.forEach(suite => {

    describe(`${suite.name} Store`, () => {

      let system = { stop: cb => cb(), };
      let store = { nuke: () => new Promise(cb => cb()), };

      beforeAll(cb => {
        system = suite.system.start((err, components) => {
          if (err) return cb(err);
          store = components.store;
          cb();
        });
      });

      beforeEach(async cb => {
        try {
          await store.nuke();
        } catch (err) {
          cb(err);
        }
        cb();
      });

      afterAll(cb => {
        store.nuke().then(() => {
          system.stop(cb);
        }).catch(cb);
      });

      describe('Save Deployment', () => {

        it('should create a deployment', async () => {
          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, });
          const deployment = await saveDeployment(data);

          expect(deployment).toBeDefined();
          expect(deployment.id).toBeDefined();
        });

        it('should permit repeat deployments', async () => {
          const release = await saveRelease(makeRelease());

          const data = makeDeployment({ release, });
          const deployment1 = await saveDeployment(data);
          const deployment2 = await saveDeployment(data);

          expect(deployment1.id).not.toBe(deployment2.id);
        });

        it('should report an error if release does not exist', async () => {
          const data = makeDeployment({ release: { id: 'missing', }, });

          await expect(
            saveDeployment(data)
          ).rejects.toHaveProperty('code', '23502');
        });

        it('should report an error if release was deleted', async () => {
          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, });
          await deleteRelease(release.id);

          await expect(
            saveDeployment(data)
          ).rejects.toHaveProperty('code', '23502');
        });
      });

      describe('Get Deployment', () => {

        it('should retrieve deployment by id', async () => {
          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, });
          const meta = makeMeta({ account: 'root', });
          const saved = await saveDeployment(data, meta);
          const deployment = await getDeployment(saved.id);

          expect(deployment).toBeDefined();
          expect(deployment.id).toBe(saved.id);
          expect(deployment.release.service.id).toBe(saved.release.service.id);
          expect(deployment.release.service.name).toBe(saved.release.service.name);
          expect(deployment.release.version).toBe(saved.release.version);
          expect(deployment.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(deployment.createdBy).toBe(meta.account);
        });

        it('should return undefined when release not found', async () => {
          const deployment = await getDeployment('missing');
          expect(deployment).toBe(undefined);
        });
      });

      describe('Delete Deployment', () => {

        it('should soft delete deployment', async () => {

          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, });
          const saved = await saveDeployment(data);

          await deleteDeployment(saved.id);
          const deployment = await getDeployment(data.id);

          expect(deployment).toBe(undefined);
        });

      });

      describe('List Deployments', () => {

        it('should list deployments, ordered by deletedOn desc, createdOn desc and id desc', async () => {

          const deployments = [
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'a',
                  },
                  version: '1',
                },
              }),
              meta: makeMeta({ account: 'root', date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'a',
                  },
                  version: '2',
                },
              }),
              meta: makeMeta({ account: 'root', date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'a',
                  },
                  version: '3',
                },
              }),
              meta: makeMeta({ account: 'root', date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'b',
                  },
                  version: '1',
                },
              }),
              meta: makeMeta({ account: 'root', date: new Date('2016-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'c',
                  },
                  version: '1',
                },
              }),
              meta: makeMeta({ account: 'root', date: new Date('2011-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'c',
                  },
                  version: '2',
                },
              }),
              meta: makeMeta({ account: 'root', date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(deployments.map(async record => {
            const release = await saveRelease(record.data.release);
            const deployment = { ...record.data, release, };
            await saveDeployment(deployment, record.meta);
          }));

          const results = (await listDeployments()).map(d => `${d.release.service.name}${d.release.version}`);
          const ordered = ['b1', 'a2', 'a1', 'a3', 'c2', 'c1',];
          expect(results).toEqual(ordered);
        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const deployments = [];

            for (var i = 0; i < 51; i++) {
              deployments.push({
                data: makeDeployment(),
              });
            }

            await Promise.all(deployments.map(async record => {
              const release = await saveRelease(record.data.release);
              const deployment = { ...record.data, release, };
              await saveDeployment(deployment);
            }));
          });

          it('should limit deployments to 50 by default', async () => {
            const results = await listDeployments();
            expect(results.length).toBe(50);
          });

          it('should limit deployments to the specified number', async () => {
            const results = await listDeployments(10, 0);
            expect(results.length).toBe(10);
          });

          it('should page results', async () => {
            const results = await listDeployments(50, 10);
            expect(results.length).toBe(41);
          });
        });
      });

      function saveRelease(release = makeRelease(), meta = makeMeta({ account: 'root', })) {
        return store.saveRelease(release, meta);
      }

      function saveDeployment(deployment = makeDeployment(), meta = makeMeta({ account: 'root', })) {
        return store.saveDeployment(deployment, meta);
      }

      function deleteRelease(id, meta = makeMeta({ account: 'root', })) {
        return store.deleteRelease(id, meta);
      }

      function getDeployment(id) {
        return store.getDeployment(id);
      }

      function listDeployments(page, limit) {
        return store.listDeployments(page, limit);
      }

      function deleteDeployment(id, meta = makeMeta({ account: 'root', })) {
        return store.deleteDeployment(id, meta);
      }
    });
  });
});
