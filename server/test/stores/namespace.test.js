import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeNamespace, makeMeta, } from '../factories';

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
          const meta = makeMeta({ account: 'root', });
          const saved = await saveNamespace(data, meta);
          const namespace = await getNamespace(saved.id);

          expect(namespace).toBeDefined();
          expect(namespace.id).toBe(saved.id);
          expect(namespace.name).toBe(data.name);
          expect(namespace.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(namespace.createdBy).toBe(meta.account);
        });

        it('should return undefined when namespace not found', async () => {
          const namespace = await getNamespace('missing');
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
              meta: makeMeta({ account: 'root', date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeNamespace({
                name: 'c',
              }),
              meta: makeMeta({ account: 'root', date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeNamespace({
                name: 'b',
              }),
              meta: makeMeta({ account: 'root', date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(namespaces.map(namespace => {
            return saveNamespace(namespace.data, namespace.meta);
          }));

          const results = (await listNamespaces()).map(n => n.name);
          expect(results).toEqual(['a', 'b', 'c',]);
        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const namespaces = [];
            for (var i = 0; i < 51; i++) {
              namespaces.push({
                data: makeNamespace(),
              });
            }

            await Promise.all(namespaces.map(async namespace => {
              await saveNamespace(namespace.data);
            }));
          });

          it('should limit namespaces to 50 by default', async () => {
            const results = await listNamespaces();
            expect(results.length).toBe(50);
          });

          it('should limit namespaces to the specified number', async () => {
            const results = await listNamespaces(10, 0);
            expect(results.length).toBe(10);
          });

          it('should page results', async () => {
            const results = await listNamespaces(50, 10);
            expect(results.length).toBe(41);
          });
        });
      });

      function saveNamespace(namespace = makeNamespace(), meta = makeMeta({ account: 'root', })) {
        return store.saveNamespace(namespace, meta);
      }

      function getNamespace(id) {
        return store.getNamespace(id);
      }

      function findNamespace(criteria) {
        return store.findNamespace(criteria);
      }

      function deleteNamespace(id, meta = makeMeta({ account: 'root', })) {
        return store.deleteNamespace(id, meta);
      }

      function listNamespaces(page, limit) {
        return store.listNamespaces(page, limit);
      }

    });
  });
});
