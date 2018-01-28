import { v4 as uuid, } from 'uuid';
import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeCluster, makeNamespace, makeDeployment, makeDeploymentLogEntry, makeRelease, makeRootMeta, } from '../factories';

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
        .remove('server')
        .remove('store.account')
        .remove('store.registry')
        .remove('store.release')
        .remove('store.cluster')
        .remove('store.namespace')
        .remove('store.deployment')
        .include(postgres),
    },
  ];

  suites.forEach(suite => {

    describe(`${suite.name} Store`, () => {

      let system = { stop: cb => cb(), };
      let store = { nuke: () => new Promise(cb => cb()), };
      let db = {
        refreshEntityCount: () => {},
        enableRefreshEntityCount: () => {},
        disableRefreshEntityCount: () => {},
      };

      beforeAll(cb => {
        system = suite.system.start((err, components) => {
          if (err) return cb(err);
          store = components.store;
          db = components.db || db;
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
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, namespace, });
          const deployment = await saveDeployment(data);

          expect(deployment).toBeDefined();
          expect(deployment.id).toBeDefined();
        });

        it('should permit repeat deployments', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());

          const data = makeDeployment({ release, namespace, });
          const deployment1 = await saveDeployment(data);
          const deployment2 = await saveDeployment(data);

          expect(deployment1.id).not.toBe(deployment2.id);
        });

        it('should report an error if release does not exist', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const data = makeDeployment({ release: { id: uuid(), }, namespace, });

          await expect(
            saveDeployment(data)
          ).rejects.toHaveProperty('code', '23502');
        });

        it('should report an error if release was deleted', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, namespace, });
          await deleteRelease(release.id);

          await expect(
            saveDeployment(data)
          ).rejects.toHaveProperty('code', '23502');
        });
      });

      describe('Save Deployment Log Entry', () => {

        it('should create deployment log entries', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());
          const deployment = await saveDeployment(makeDeployment({ release, namespace, }));
          const data = makeDeploymentLogEntry({ deployment, });
          const logEntry = await saveDeploymentLogEntry(data);

          expect(logEntry).toBeDefined();
          expect(logEntry.id).toBeDefined();
        });
      });

      describe('Get Deployment', () => {

        it('should retrieve deployment by id', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, namespace, });
          const meta = makeRootMeta();
          const saved = await saveDeployment(data, meta);
          const deployment = await getDeployment(saved.id);

          expect(deployment).toBeDefined();
          expect(deployment.id).toBe(saved.id);
          expect(deployment.namespace.id).toBe(saved.namespace.id);
          expect(deployment.namespace.name).toBe(saved.namespace.name);
          expect(deployment.namespace.cluster.id).toBe(saved.namespace.cluster.id);
          expect(deployment.namespace.cluster.name).toBe(saved.namespace.cluster.name);
          expect(deployment.namespace.cluster.context).toBe(saved.namespace.cluster.context);
          expect(deployment.release.service.id).toBe(saved.release.service.id);
          expect(deployment.release.service.name).toBe(saved.release.service.name);
          expect(deployment.release.version).toBe(saved.release.version);
          expect(deployment.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(deployment.createdBy.id).toBe(meta.account.id);
          expect(deployment.createdBy.displayName).toBe(meta.account.displayName);
        });

        it('should return undefined when release not found', async () => {
          const deployment = await getDeployment(uuid());
          expect(deployment).toBe(undefined);
        });

        it('should retrieve deployment log entries', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, namespace, });
          const meta = makeRootMeta();
          const saved = await saveDeployment(data, meta);

          const logEntries = [
            makeDeploymentLogEntry({
              deployment: saved,
              writtenOn: new Date('2014-07-01T10:11:12.000Z'),
              writtenTo: 'stdin',
              content: 'Message 1',
            }),
            makeDeploymentLogEntry({
              deployment: saved,
              writtenOn: new Date('2014-07-01T10:11:12.000Z'),
              writtenTo: 'stdin',
              content: 'Message 2',
            }),
            makeDeploymentLogEntry({
              deployment: saved,
              writtenOn: new Date('2014-07-01T10:11:14.000Z'),
              writtenTo: 'stderr',
              content: 'Message 4',
            }),
            makeDeploymentLogEntry({
              deployment: saved,
              writtenOn: new Date('2014-07-01T10:11:13.000Z'),
              writtenTo: 'stdout',
              content: 'Message 3',
            }),
          ];

          for (const logEntry of logEntries) {
            await saveDeploymentLogEntry(logEntry);
          }

          const deployment = await getDeployment(saved.id);
          expect(deployment).toBeDefined();
          expect(deployment.log.length).toBe(4);

          expect(deployment.log[0].writtenOn.toISOString()).toBe('2014-07-01T10:11:12.000Z');
          expect(deployment.log[0].writtenTo).toBe('stdin');
          expect(deployment.log[0].content).toBe('Message 1');

          expect(deployment.log[1].writtenOn.toISOString()).toBe('2014-07-01T10:11:12.000Z');
          expect(deployment.log[1].writtenTo).toBe('stdin');
          expect(deployment.log[1].content).toBe('Message 2');

          expect(deployment.log[2].writtenOn.toISOString()).toBe('2014-07-01T10:11:13.000Z');
          expect(deployment.log[2].writtenTo).toBe('stdout');
          expect(deployment.log[2].content).toBe('Message 3');

          expect(deployment.log[3].writtenOn.toISOString()).toBe('2014-07-01T10:11:14.000Z');
          expect(deployment.log[3].writtenTo).toBe('stderr');
          expect(deployment.log[3].content).toBe('Message 4');
        });
      });

      describe('Find Deployments', () => {

        it('should list deployments, ordered by createdOn desc and id desc', async () => {

          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));

          const deployments = [
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'a',
                  },
                  version: '1',
                },
                namespace,
              }),
              meta: makeRootMeta({ date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'a',
                  },
                  version: '2',
                },
                namespace,
              }),
              meta: makeRootMeta({ date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'a',
                  },
                  version: '3',
                },
                namespace,
              }),
              meta: makeRootMeta({ date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'b',
                  },
                  version: '1',
                },
                namespace,
              }),
              meta: makeRootMeta({ date: new Date('2016-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'c',
                  },
                  version: '1',
                },
                namespace,
              }),
              meta: makeRootMeta({ date: new Date('2011-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeDeployment({
                release: {
                  service: {
                    name: 'c',
                  },
                  version: '2',
                },
                namespace,
              }),
              meta: makeRootMeta({ date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(deployments.map(record => {
            return saveRelease(record.data.release).then(release => {
              const deployment = { ...record.data, release, };
              return saveDeployment(deployment, record.meta);
            });
          }));

          const results = await findDeployments();
          expect(results.items.map(d => `${d.release.service.name}${d.release.version}`)).toEqual(['b1', 'a2', 'a1', 'a3', 'c2', 'c1',]);
          expect(results.count).toBe(6);
          expect(results.limit).toBe(50);
          expect(results.offset).toBe(0);
        });

        it('should filter deployments by namespace ids', async () => {
          const cluster = await saveCluster();
          const namespace1 = await saveNamespace({ name: 'ns1', cluster, });
          const namespace2 = await saveNamespace({ name: 'ns2', cluster, });
          const release1 = await saveRelease(makeRelease());
          const release2 = await saveRelease(makeRelease());
          const deployment1 = makeDeployment({
            release: release1,
            namespace: namespace1,
          });
          const deployment2 = makeDeployment({
            release: release2,
            namespace: namespace2,
          });

          const saved1 = await saveDeployment(deployment1);
          const saved2 = await saveDeployment(deployment2);

          const results1 = await findDeployments({ namespaces: [ namespace1.id, ], });
          expect(results1.count).toBe(1);
          expect(results1.items[0].id).toBe(saved1.id);

          const results2 = await findDeployments({ namespaces: [ namespace2.id, ], });
          expect(results2.count).toBe(1);
          expect(results2.items[0].id).toBe(saved2.id);

          const results3 = await findDeployments({ namespaces: [ namespace1.id, namespace2.id, ], });
          expect(results3.count).toBe(2);
        });

        xit('should filter deployments by criteria', async () => {
          const namespace1 = await saveNamespace();
          const namespace2 = await saveNamespace();
          const deployment1 = makeDeployment({
            name: 'r1',
            service: {
              namespace: namespace1,
            },
          });
          const deployment2 = makeDeployment({
            name: 'r2',
            service: {
              namespace: namespace1,
            },
          });
          const deployment3 = makeDeployment({
            name: 'r1',
            service: {
              namespace: namespace2,
            },
          });

          const saved1 = await saveDeployment(deployment1);
          const saved2 = await saveDeployment(deployment2);
          const saved3 = await saveDeployment(deployment3);

          const results1 = await findDeployments({ service: deployment1.release.service.name, namespace: deployment1.namespace.name, });
          expect(results1.count).toBe(1);
          expect(results1.items[0].id).toBe(saved1.id);

          const results2 = await findDeployments({ service: deployment2.release.service.name, namespace: deployment2.namespace.name, });
          expect(results2.count).toBe(1);
          expect(results2.items[0].id).toBe(saved2.id);

          const results3 = await findDeployments({ service: deployment3.release.service.name, namespace: deployment3.namespace.name, });
          expect(results3.count).toBe(1);
          expect(results3.items[0].id).toBe(saved3.id);
        });

        it('should count active deployments', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());

          const results1 = await findDeployments();
          expect(results1.count).toBe(0);

          const saved = await saveDeployment(makeDeployment({ release, namespace, }));
          const results2 = await findDeployments();
          expect(results2.count).toBe(1);

          await deleteDeployment(saved.id);
          const results3 = await findDeployments();
          expect(results3.count).toBe(0);
        });

        it('should exclude deleted releases from deployment count', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());

          await saveDeployment(makeDeployment({ release, namespace, }));
          const results1 = await findDeployments();
          expect(results1.count).toBe(1);

          await deleteRelease(release.id);
          const results2 = await findDeployments();
          expect(results2.count).toBe(0);
        });

        // Enable when we can get, delete and list services
        xit('should exclude deleted services from deployment count', async () => {
          const release = await saveRelease(makeRelease({
            service: {
              name: 'doomed',
            },
          }));

          await saveDeployment(makeDeployment({ release, }));
          const results1 = await findDeployments();
          expect(results1.count).toBe(1);

          await deleteService(release.service.id);
          const results2 = await findDeployments();
          expect(results2.count).toBe(0);

          function deleteService() {}
        });

        it('should exclude deleted namespaces from deployment count', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());

          await saveDeployment(makeDeployment({ release, namespace, }));
          const results1 = await findDeployments();
          expect(results1.count).toBe(1);

          await deleteNamespace(namespace.id);
          const results2 = await findDeployments();
          expect(results2.count).toBe(0);
        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const deployments = [];

            const cluster = await saveCluster();
            const namespace = await saveNamespace(makeNamespace({ cluster, }));

            for (var i = 0; i < 51; i++) {
              deployments.push({
                data: makeDeployment({ namespace, }),
              });
            }

            db.disableRefreshEntityCount();
            await Promise.all(deployments.map(async record => {
              const release = await saveRelease(record.data.release);
              const deployment = { ...record.data, release, };
              return saveDeployment(deployment);
            }));
            await db.enableRefreshEntityCount();
          });

          it('should limit deployments to 50 by default', async () => {
            const results = await findDeployments();
            expect(results.items.length).toBe(50);
            expect(results.count).toBe(51);
            expect(results.limit).toBe(50);
            expect(results.offset).toBe(0);
          });

          it('should limit deployments to the specified number', async () => {
            const results = await findDeployments({}, 10, 0);
            expect(results.items.length).toBe(10);
            expect(results.count).toBe(51);
            expect(results.limit).toBe(10);
            expect(results.offset).toBe(0);
          });

          it('should page deployments list', async () => {
            const results = await findDeployments({}, 50, 10);
            expect(results.items.length).toBe(41);
            expect(results.count).toBe(51);
            expect(results.limit).toBe(50);
            expect(results.offset).toBe(10);
          });
        });
      });

      describe('Delete Deployment', () => {

        it('should soft delete deployment', async () => {
          const cluster = await saveCluster();
          const namespace = await saveNamespace(makeNamespace({ cluster, }));
          const release = await saveRelease(makeRelease());
          const data = makeDeployment({ release, namespace, });
          const saved = await saveDeployment(data);

          await deleteDeployment(saved.id);
          const deployment = await getDeployment(data.id);

          expect(deployment).toBe(undefined);
        });

      });


      function saveCluster(cluster = makeCluster(), meta = makeRootMeta()) {
        return store.saveCluster(cluster, meta);
      }

      function saveNamespace(namespace = makeNamespace(), meta = makeRootMeta()) {
        return store.saveNamespace(namespace, meta);
      }

      function saveRelease(release = makeRelease(), meta = makeRootMeta()) {
        return store.saveRelease(release, meta);
      }

      function saveDeployment(deployment = makeDeployment(), meta = makeRootMeta()) {
        return store.saveDeployment(deployment, meta);
      }

      function saveDeploymentLogEntry(deploymentLogEntry = makeDeploymentLogEntry()) {
        return store.saveDeploymentLogEntry(deploymentLogEntry);
      }

      function deleteRelease(id, meta = makeRootMeta()) {
        return store.deleteRelease(id, meta);
      }

      function getDeployment(id) {
        return store.getDeployment(id);
      }

      function findDeployments(criteria, page, limit) {
        return store.findDeployments(criteria, page, limit);
      }

      function deleteDeployment(id, meta = makeRootMeta()) {
        return store.deleteDeployment(id, meta);
      }

      function deleteNamespace(id, meta = makeRootMeta()) {
        return store.deleteNamespace(id, meta);
      }

    });
  });
});
