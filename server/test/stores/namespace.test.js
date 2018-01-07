import { v4 as uuid, } from 'uuid';
import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeNamespace, makeRootMeta, } from '../factories';

describe('Namespace Store', () => {

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
              user: 'namespace_test',
              password: 'password',
            },
          },
        })
        .remove('server')
        .remove('store.namespace')
        .remove('store.release')
        .remove('store.deployment')
        .remove('store.account')
        .include(postgres),
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

      describe('Save namespace', () => {

        it('should create a namespace', async () => {
          const namespace = await saveNamespace();
          expect(namespace).toBeDefined();
          expect(namespace.id).toBeDefined();
        });

        it('should prevent duplicate namespaces', async () => {
          const data = makeNamespace({
            name: 'same-namespace',
          });

          await saveNamespace(data);
          await expect(
            saveNamespace(data)
          ).rejects.toHaveProperty('code', '23505');
        });
      });

      describe('Get Namespace', () => {

        it('should retrieve namespace by id', async () => {
          const data = makeNamespace();
          const meta = makeRootMeta();
          const saved = await saveNamespace(data, meta);
          const namespace = await getNamespace(saved.id);

          expect(namespace).toBeDefined();
          expect(namespace.id).toBe(saved.id);
          expect(namespace.name).toBe(data.name);
          expect(namespace.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(namespace.createdBy.id).toBe(meta.account.id);
          expect(namespace.createdBy.displayName).toBe(meta.account.displayName);
        });

        it('should return undefined when namespace not found', async () => {
          const namespace = await getNamespace(uuid());
          expect(namespace).toBe(undefined);
        });
      });

      describe('Find Namespace', () => {

        it('should find a namespace by name', async () => {
          const data = makeNamespace();
          const saved = await saveNamespace(data);
          const namespace = await findNamespace({ name: data.name, });

          expect(namespace).toBeDefined();
          expect(namespace.id).toBe(saved.id);
        });

        it('should return undefined when name not found', async () => {
          const data = makeNamespace();
          await saveNamespace(data);

          const namespace = await findNamespace({ name: 'missing', });
          expect(namespace).toBe(undefined);
        });
      });

      describe('Delete Namespace', () => {

        it('should soft delete namespace', async () => {
          const saved = await saveNamespace();
          await deleteNamespace(saved.id);

          const namespace = await getNamespace(saved.id);
          expect(namespace).toBe(undefined);
        });
      });

      describe('List Namespaces', () => {

        it('should list namespaces, ordered by name asc', async () => {

          const namespaces = [
            {
              data: makeNamespace({
                name: 'a',
              }),
              meta: makeRootMeta({ date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeNamespace({
                name: 'c',
              }),
              meta: makeRootMeta({ date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeNamespace({
                name: 'b',
              }),
              meta: makeRootMeta({ date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(namespaces.map(namespace => {
            return saveNamespace(namespace.data, namespace.meta);
          }));

          const results = await listNamespaces();
          expect(results.items.map(n => n.name)).toEqual(['a', 'b', 'c', 'default',]);
          expect(results.count).toBe(4);
          expect(results.limit).toBe(50);
          expect(results.offset).toBe(0);
        });

        it('should exclude inactive namespaces', async () => {
          const results1 = await listNamespaces();
          expect(results1.count).toBe(1);

          const saved = await saveNamespace(makeNamespace());
          const results2 = await listNamespaces();
          expect(results2.count).toBe(2);

          await deleteNamespace(saved.id);
          const results3 = await listNamespaces();
          expect(results3.count).toBe(1);
        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const namespaces = [];
            for (var i = 0; i < 51; i++) {
              namespaces.push({
                data: makeNamespace({
                  // Must be alphebetically greater than 'default'
                  name: `x-namespace-${i}`,
                }),
              });
            }

            await Promise.all(namespaces.map(async namespace => {
              return saveNamespace(namespace.data);
            }));
          });

          it('should limit namespaces to 50 by default', async () => {
            const results = await listNamespaces();
            expect(results.items.length).toBe(50);
            expect(results.count).toBe(52);
            expect(results.limit).toBe(50);
            expect(results.offset).toBe(0);
          });

          it('should limit namespaces to the specified number', async () => {
            const results = await listNamespaces(10, 0);
            expect(results.items.length).toBe(10);
            expect(results.count).toBe(52);
            expect(results.limit).toBe(10);
            expect(results.offset).toBe(0);
          });

          it('should page namespaces list', async () => {
            const results = await listNamespaces(50, 10);
            expect(results.items.length).toBe(42);
            expect(results.count).toBe(52);
            expect(results.limit).toBe(50);
            expect(results.offset).toBe(10);
          });
        });
      });

      function saveNamespace(namespace = makeNamespace(), meta = makeRootMeta()) {
        return store.saveNamespace(namespace, meta);
      }

      function getNamespace(id) {
        return store.getNamespace(id);
      }

      function findNamespace(criteria) {
        return store.findNamespace(criteria);
      }

      function deleteNamespace(id, meta = makeRootMeta()) {
        return store.deleteNamespace(id, meta);
      }

      function listNamespaces(page, limit) {
        return store.listNamespaces(page, limit);
      }

    });
  });
});
