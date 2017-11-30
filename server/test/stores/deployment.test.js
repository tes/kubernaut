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

      describe('Save Deployment', () => {

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

        it('should permit repeat deployments', async () => {
          const release = await store.saveRelease(makeRelease(), makeMeta());

          const data = makeDeployment({ release, });
          const meta = makeMeta();
          const deployment1 = await store.saveDeployment(data, meta);
          const deployment2 = await store.saveDeployment(data, meta);

          expect(deployment1.id).not.toBe(deployment2.id);
        });

      });

      describe('Get Deployment', () => {

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
          expect(deployment.release.template.source.yaml).toBe(saved.release.template.source.yaml);
          expect(deployment.release.template.source.json).toEqual(saved.release.template.source.json);
          expect(deployment.release.template.checksum).toBe(saved.release.template.checksum);
          expect(deployment.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(deployment.createdBy).toBe(meta.user);
        });

        it('should return undefined when release not found', async () => {
          const deployment = await store.getDeployment('missing');
          expect(deployment).toBe(undefined);
        });
      });

      describe('Delete Deployment', () => {

        it('should soft delete deployment', async () => {

          const release = await store.saveRelease(makeRelease(), makeMeta());
          const data = makeDeployment({ release, });
          const meta = makeMeta();
          const saved = await store.saveDeployment(data, meta);

          await store.deleteDeployment(saved.id, makeMeta());
          const deployment = await store.getDeployment(data.id);

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
              meta: makeMeta({ user: 'third', date: new Date('2014-07-01T10:11:12.000Z'), }),
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
              meta: makeMeta({ user: 'second', date: new Date('2015-07-01T10:11:12.000Z'), }),
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
              meta: makeMeta({ user: 'fourth', date: new Date('2013-07-01T10:11:12.000Z'), }),
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
              meta: makeMeta({ user: 'first', date: new Date('2016-07-01T10:11:12.000Z'), }),
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
              meta: makeMeta({ user: 'sixth', date: new Date('2011-07-01T10:11:12.000Z'), }),
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
              meta: makeMeta({ user: 'fifth', date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(deployments.map(async record => {
            const release = await store.saveRelease(record.data.release, makeMeta());
            const deployment = { ...record.data, release, };
            await store.saveDeployment(deployment, record.meta);
          }));

          const results = await store.listDeployments();
          const users = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth',];
          expect(results.length).toBe(users.length);
          users.forEach((user, index) => {
            expect(results[index].createdBy).toBe(user);
          });

        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const deployments = [];

            for (var i = 0; i < 51; i++) {
              deployments.push({
                data: makeDeployment(),
                meta: makeMeta(),
              });
            }

            await Promise.all(deployments.map(async record => {
              const release = await store.saveRelease(record.data.release, makeMeta());
              const deployment = { ...record.data, release, };
              await store.saveDeployment(deployment, record.meta);
            }));
          });

          it('should limit deployments to 50 by default', async () => {
            const results = await store.listDeployments();
            expect(results.length).toBe(50);
          });

          it('should limit deployments to the specified number', async () => {
            const results = await store.listDeployments(10, 0);
            expect(results.length).toBe(10);
          });

          it('should page results', async () => {
            const results = await store.listDeployments(50, 10);
            expect(results.length).toBe(41);
          });

        });
      });
    });
  });
});
