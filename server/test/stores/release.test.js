import { v4 as uuid, } from 'uuid';
import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeRegistry, makeRelease, makeRootMeta, } from '../factories';

describe('Release Store', () => {

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
              user: 'release_test',
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

      describe('Save release', () => {

        it('should create a release', async () => {
          const release = await saveRelease();
          expect(release).toBeDefined();
          expect(release.id).toBeDefined();
        });

        it('should prevent duplicate releases', async () => {
          const registry = await saveRegistry(makeRegistry({ name: 'same-registry', }));
          const data = makeRelease({
            service: {
              name: 'same-service',
              registry,
            },
            version: 'same-version',
          });

          await saveRelease(data);
          await expect(
            saveRelease(data)
          ).rejects.toHaveProperty('code', '23505');
        });

        it('should permit differently named services in the same registry to have the same release version', async () => {
          const registry = await saveRegistry(makeRegistry({ name: 'same-registry', }));
          const data1 = makeRelease({
            service: {
              name: 'service-1',
              registry,
            },
            version: 'same-version',
          });
          await saveRelease(data1);

          const data2 = makeRelease({
            service: {
              name: 'service-2',
              registry,
            },
            version: 'same-version',
          });
          await saveRelease(data2);
        });

        it('should permit similarly named services in different registrys to have the same release version', async () => {
          await saveRegistry(makeRegistry({ name: 'registry-1', }));
          await saveRegistry(makeRegistry({ name: 'registry-2', }));

          const data1 = makeRelease({
            service: {
              name: 'same-service',
              registry: {
                name: 'registry-1',
              },
            },
            version: 'same-version',
          });
          await saveRelease(data1);

          const data2 = makeRelease({
            service: {
              name: 'same-service',
              registry: {
                name: 'registry-2',
              },
            },
            version: 'same-version',
          });
          await saveRelease(data2);
        });

        it('should permit multiple releases of a service', async () => {
          const data1 = makeRelease({
            service: {
              name: 'same-service',
            },
            version: 'version-1',
          });
          await saveRelease(data1);

          const data2 = makeRelease({
            service: {
              name: 'same-service',
            },
            version: 'version-2',
          });
          await saveRelease(data2);
        });
      });

      describe('Get Release', () => {

        it('should retrieve release by id', async () => {
          const data = makeRelease();
          const meta = makeRootMeta();
          const saved = await saveRelease(data, meta);
          const release = await getRelease(saved.id);

          expect(release).toBeDefined();
          expect(release.id).toBe(saved.id);
          expect(release.service.id).toBe(saved.service.id);
          expect(release.service.name).toBe(data.service.name);
          expect(release.service.registry.name).toBe(data.service.registry.name);
          expect(release.version).toBe(data.version);
          expect(release.template.id).toBe(saved.template.id);
          expect(release.template.source.yaml).toBe(data.template.source.yaml);
          expect(release.template.source.json).toEqual(data.template.source.json);
          expect(release.template.checksum).toBe(data.template.checksum);
          expect(release.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(release.createdBy.id).toBe(meta.account.id);
          expect(release.createdBy.displayName).toBe(meta.account.displayName);
          expect(release.attributes.template).toBe(data.attributes.template);
          expect(release.attributes.image).toBe(data.attributes.image);
        });

        it('should return undefined when release not found', async () => {
          const release = await getRelease(uuid());
          expect(release).toBe(undefined);
        });
      });

      describe('Find Release', () => {

        it('should find a release by service name, registry and release version', async () => {
          const data = makeRelease();
          const saved = await saveRelease(data);
          const release = await findRelease({ name: data.service.name, registry: data.service.registry.name, version: data.version, });

          expect(release).toBeDefined();
          expect(release.id).toBe(saved.id);
        });

        it('should return undefined when service not found', async () => {
          const data = makeRelease();
          await saveRelease(data);

          const release = await findRelease({ name: 'missing', registry: data.service.registry.name, version: data.version, });
          expect(release).toBe(undefined);
        });


        it('should return undefined when registry not found', async () => {
          const data = makeRelease();
          await saveRelease(data);

          const release = await findRelease({ name: data.service.name, registry: 'missing', version: data.version, });
          expect(release).toBe(undefined);
        });

        it('should return undefined when version not found', async () => {
          const data = makeRelease();
          await saveRelease(data);

          const release = await findRelease({ name: data.service.name, registry: data.service.registry.name, version: 'missing', });
          expect(release).toBe(undefined);
        });
      });

      describe('Delete Release', () => {

        it('should soft delete release', async () => {
          const saved = await saveRelease();
          await deleteRelease(saved.id);

          const release = await getRelease(saved.id);
          expect(release).toBe(undefined);
        });
      });

      describe('List Releases', () => {

        it('should list releases, ordered by createdOn desc and id desc', async () => {

          const releases = [
            {
              data: makeRelease({
                service: {
                  name: 'a',
                },
                version: '1',
              }),
              meta: makeRootMeta({ date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'a',
                },
                version: '2',
              }),
              meta: makeRootMeta({ date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'a',
                },
                version: '3',
              }),
              meta: makeRootMeta({ date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'b',
                },
                version: '1',
              }),
              meta: makeRootMeta({ date: new Date('2016-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'c',
                },
                version: '1',
              }),
              meta: makeRootMeta({ date: new Date('2011-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'c',
                },
                version: '2',
              }),
              meta: makeRootMeta({ date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(releases.map(release => {
            return saveRelease(release.data, release.meta);
          }));

          const results = await listReleases();
          expect(results.items.map(r => `${r.service.name}${r.version}`)).toEqual(['b1', 'a2', 'a1', 'a3', 'c2', 'c1',]);
          expect(results.count).toBe(6);
          expect(results.limit).toBe(50);
          expect(results.offset).toBe(0);
        });

        it('should return slim release', async () => {
          await saveRelease(makeRelease());

          const releases = await listReleases();
          expect(releases.items.length).toBe(1);
          expect(releases.items[0].template).toBe(undefined);
          expect(Object.keys(releases.items[0].attributes).length).toBe(0);
        });

        it('should exclude inactive releases', async () => {
          const results1 = await listReleases();
          expect(results1.count).toBe(0);

          const saved = await saveRelease();
          const results2 = await listReleases();
          expect(results2.count).toBe(1);

          await deleteRelease(saved.id);
          const results3 = await listReleases();
          expect(results3.count).toBe(0);
        });

        // Enable when we can get, delete and list services
        xit('should exclude deleted services from release count', async () => {
          const release = await saveRelease(makeRelease({
            service: {
              name: 'doomed',
            },
          }));

          const results1 = await listReleases();
          expect(results1.count).toBe(1);

          await deleteService(release.service.id);
          const results2 = await listReleases();
          expect(results2.count).toBe(0);

          function deleteService() {}
        });

        it('should exclude deleted registrys from release count', async () => {
          const registry = await saveRegistry(makeRegistry());
          await saveRelease(makeRelease({
            service: {
              registry,
            },
          }));

          const results1 = await listReleases();
          expect(results1.count).toBe(1);

          await deleteRegistry(registry.id);
          const results2 = await listReleases();
          expect(results2.count).toBe(0);
        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const releases = [];
            for (var i = 0; i < 51; i++) {
              releases.push({
                data: makeRelease(),
              });
            }

            db.disableRefreshEntityCount();
            await Promise.all(releases.map(async release => {
              return saveRelease(release.data);
            }));
            await db.enableRefreshEntityCount();
          });

          it('should limit releases to 50 by default', async () => {
            const results = await listReleases();
            expect(results.items.length).toBe(50);
            expect(results.count).toBe(51);
            expect(results.limit).toBe(50);
            expect(results.offset).toBe(0);
          });

          it('should limit releases to the specified number', async () => {
            const results = await listReleases(10, 0);
            expect(results.items.length).toBe(10);
            expect(results.count).toBe(51);
            expect(results.limit).toBe(10);
            expect(results.offset).toBe(0);
          });

          it('should page releases list', async () => {
            const results = await listReleases(50, 10);
            expect(results.items.length).toBe(41);
            expect(results.count).toBe(51);
            expect(results.limit).toBe(50);
            expect(results.offset).toBe(10);
          });
        });
      });

      function saveRelease(release = makeRelease(), meta = makeRootMeta()) {
        return store.saveRelease(release, meta);
      }

      function getRelease(id) {
        return store.getRelease(id);
      }

      function findRelease(criteria) {
        return store.findRelease(criteria);
      }

      function deleteRelease(id, meta = makeRootMeta()) {
        return store.deleteRelease(id, meta);
      }

      function listReleases(page, limit) {
        return store.listReleases(page, limit);
      }

      function saveRegistry(registry = makeRegistry(), meta = makeRootMeta()) {
        return store.saveRegistry(registry, meta);
      }

      function deleteRegistry(id, meta = makeRootMeta()) {
        return store.deleteRegistry(id, meta);
      }

    });
  });
});
