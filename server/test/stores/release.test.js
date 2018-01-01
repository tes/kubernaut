import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeNamespace, makeRelease, makeMeta, } from '../factories';

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

      describe('Save release', () => {

        it('should create a release', async () => {
          const release = await saveRelease();
          expect(release).toBeDefined();
          expect(release.id).toBeDefined();
        });

        it('should prevent duplicate releases', async () => {
          const namespace = await saveNamespace(makeNamespace({ name: 'same-namespace', }));
          const data = makeRelease({
            service: {
              name: 'same-service',
              namespace,
            },
            version: 'same-version',
          });

          await saveRelease(data);
          await expect(
            saveRelease(data)
          ).rejects.toHaveProperty('code', '23505');
        });

        it('should permit differently named services in the same namespace to have the same release version', async () => {
          const namespace = await saveNamespace(makeNamespace({ name: 'same-namespace', }));
          const data1 = makeRelease({
            service: {
              name: 'service-1',
              namespace,
            },
            version: 'same-version',
          });
          await saveRelease(data1);

          const data2 = makeRelease({
            service: {
              name: 'service-2',
              namespace,
            },
            version: 'same-version',
          });
          await saveRelease(data2);
        });

        it('should permit similarly named services in different namespaces to have the same release version', async () => {
          await saveNamespace(makeNamespace({ name: 'namespace-1', }));
          await saveNamespace(makeNamespace({ name: 'namespace-2', }));

          const data1 = makeRelease({
            service: {
              name: 'same-service',
              namespace: {
                name: 'namespace-1',
              },
            },
            version: 'same-version',
          });
          await saveRelease(data1);

          const data2 = makeRelease({
            service: {
              name: 'same-service',
              namespace: {
                name: 'namespace-2',
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
          const meta = makeMeta({ account: 'root', });
          const saved = await saveRelease(data, meta);
          const release = await getRelease(saved.id);

          expect(release).toBeDefined();
          expect(release.id).toBe(saved.id);
          expect(release.service.id).toBe(saved.service.id);
          expect(release.service.name).toBe(data.service.name);
          expect(release.service.namespace.name).toBe(data.service.namespace.name);
          expect(release.version).toBe(data.version);
          expect(release.template.id).toBe(saved.template.id);
          expect(release.template.source.yaml).toBe(data.template.source.yaml);
          expect(release.template.source.json).toEqual(data.template.source.json);
          expect(release.template.checksum).toBe(data.template.checksum);
          expect(release.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(release.createdBy).toBe(meta.account);
          expect(release.attributes.template).toBe(data.attributes.template);
          expect(release.attributes.image).toBe(data.attributes.image);
        });

        it('should return undefined when release not found', async () => {
          const release = await getRelease('missing');
          expect(release).toBe(undefined);
        });
      });

      describe('Find Release', () => {

        it('should find a release by service name, namespace and release version', async () => {
          const data = makeRelease();
          const saved = await saveRelease(data);
          const release = await findRelease({ name: data.service.name, namespace: data.service.namespace.name, version: data.version, });

          expect(release).toBeDefined();
          expect(release.id).toBe(saved.id);
        });

        it('should return undefined when service not found', async () => {
          const data = makeRelease();
          await saveRelease(data);

          const release = await findRelease({ name: 'missing', namespace: data.service.namespace.name, version: data.version, });
          expect(release).toBe(undefined);
        });


        it('should return undefined when namespace not found', async () => {
          const data = makeRelease();
          await saveRelease(data);

          const release = await findRelease({ name: data.service.name, namespace: 'missing', version: data.version, });
          expect(release).toBe(undefined);
        });

        it('should return undefined when version not found', async () => {
          const data = makeRelease();
          await saveRelease(data);

          const release = await findRelease({ name: data.service.name, namespace: data.service.namespace.name, version: 'missing', });
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
              meta: makeMeta({ account: 'root', date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'a',
                },
                version: '2',
              }),
              meta: makeMeta({ account: 'root', date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'a',
                },
                version: '3',
              }),
              meta: makeMeta({ account: 'root', date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'b',
                },
                version: '1',
              }),
              meta: makeMeta({ account: 'root', date: new Date('2016-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'c',
                },
                version: '1',
              }),
              meta: makeMeta({ account: 'root', date: new Date('2011-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'c',
                },
                version: '2',
              }),
              meta: makeMeta({ account: 'root', date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(releases.map(release => {
            return saveRelease(release.data, release.meta);
          }));

          const results = (await listReleases()).map(r => `${r.service.name}${r.version}`);
          expect(results).toEqual(['b1', 'a2', 'a1', 'a3', 'c2', 'c1',]);
        });

        it('should return slim release', async () => {
          await saveRelease(makeRelease());

          const releases = await listReleases();
          expect(releases.length).toBe(1);
          expect(releases[0].template).toBe(undefined);
          expect(Object.keys(releases[0].attributes).length).toBe(0);
        });

        describe('Pagination', () => {

          beforeEach(async () => {
            const releases = [];
            for (var i = 0; i < 51; i++) {
              releases.push({
                data: makeRelease(),
              });
            }

            await Promise.all(releases.map(async release => {
              return saveRelease(release.data);
            }));
          });

          it('should limit releases to 50 by default', async () => {
            const results = await listReleases();
            expect(results.length).toBe(50);
          });

          it('should limit releases to the specified number', async () => {
            const results = await listReleases(10, 0);
            expect(results.length).toBe(10);
          });

          it('should page releases list', async () => {
            const results = await listReleases(50, 10);
            expect(results.length).toBe(41);
          });
        });
      });

      function saveNamespace(namespace = makeNamespace(), meta = makeMeta({ account: 'root', })) {
        return store.saveNamespace(namespace, meta);
      }

      function saveRelease(release = makeRelease(), meta = makeMeta({ account: 'root', })) {
        return store.saveRelease(release, meta);
      }

      function getRelease(id) {
        return store.getRelease(id);
      }

      function findRelease(criteria) {
        return store.findRelease(criteria);
      }

      function deleteRelease(id, meta = makeMeta({ account: 'root', })) {
        return store.deleteRelease(id, meta);
      }

      function listReleases(page, limit) {
        return store.listReleases(page, limit);
      }

    });
  });
});
