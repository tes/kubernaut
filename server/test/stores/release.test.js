import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeRelease, makeMeta, } from '../factories';

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
        .remove('server')
        .remove('store.release')
        .remove('store.profile')
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

      describe('Save release', () => {

        it('should create a release', async () => {
          await store.saveRelease(makeRelease(), makeMeta());
        });

        it('should prevent duplicate release versions', async () => {
          const data = makeRelease({
            service: {
              name: 'duplicate-release-version',
            }, version: '123',
          });
          await store.saveRelease(data, makeMeta());
          await expect(store.saveRelease(data, makeMeta())).rejects.toHaveProperty('code', '23505');
        });

        it('should permit multiple release versions', async () => {
          const data1 = makeRelease({ name: 'multiple-release-versions', version: '1', });
          await store.saveRelease(data1, makeMeta());

          const data2 = makeRelease({ name: 'multiple-release-versions', version: '2', });
          await store.saveRelease(data2, makeMeta());
        });

      });

      describe('Get Release', () => {

        it('should retrieve releases by id', async () => {

          const data = makeRelease();
          const meta = makeMeta({ date: new Date(), user: 'cressie176', });
          const saved = await store.saveRelease(data, meta);
          const release = await store.getRelease(saved.id);

          expect(release).toBeDefined();
          expect(release.id).toBe(saved.id);
          expect(release.service.id).toBe(saved.service.id);
          expect(release.service.name).toBe(data.service.name);
          expect(release.version).toBe(data.version);
          expect(release.template.id).toBe(saved.template.id);
          expect(release.template.source).toBe(data.template.source);
          expect(release.template.checksum).toBe(data.template.checksum);
          expect(release.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(release.createdBy).toBe(meta.user);
          expect(release.attributes.template).toBe(data.attributes.template);
          expect(release.attributes.image).toBe(data.attributes.image);
        });

        it('should return undefined when release not found', async () => {
          const release = await store.getRelease('missing');
          expect(release).toBe(undefined);
        });
      });

      describe('Delete Release', () => {

        it('should soft delete release', async () => {

          const data = makeRelease();
          await store.saveRelease(data, makeMeta());

          await store.deleteRelease(data.id, makeMeta());
          const release = await store.getRelease(data.id);

          expect(release).toBe(undefined);
        });

      });

      describe('List Releases', () => {

        it('should list releases, ordered by deletedOn desc, createdOn desc and id desc', async () => {

          const releases = [
            {
              data: makeRelease({
                service: {
                  name: 'a',
                },
                version: '1',
              }),
              meta: makeMeta({ user: 'third', date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'a',
                },
                version: '2',
              }),
              meta: makeMeta({ user: 'second', date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'a',
                },
                version: '3',
              }),
              meta: makeMeta({ user: 'fourth', date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'b',
                },
                version: '1',
              }),
              meta: makeMeta({ user: 'first', date: new Date('2016-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'c',
                },
                version: '1',
              }),
              meta: makeMeta({ user: 'sixth', date: new Date('2011-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({
                service: {
                  name: 'c',
                },
                version: '2',
              }),
              meta: makeMeta({ user: 'fifth', date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(releases.map(async release => {
            await store.saveRelease(release.data, release.meta);
          }));

          const results = await store.listReleases();
          const users = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth',];
          expect(results.length).toBe(users.length);
          users.forEach((user, index) => {
            expect(results[index].createdBy).toBe(user);
          });

        });

        it('should return slim release', async () => {
          await store.saveRelease(makeRelease(), makeMeta());

          const releases = await store.listReleases();
          expect(releases.length).toBe(1);
          expect(releases[0].template).toBe(undefined);
          expect(Object.keys(releases[0].attributes).length).toBe(0);
        });

        it('should limit results to 50 by default', async () => {

          const releases = [];
          for (var i = 0; i < 51; i++) {
            releases.push({
              data: makeRelease(),
              meta: makeMeta(),
            });
          }

          await Promise.all(releases.map(async release => {
            await store.saveRelease(release.data, release.meta);
          }));

          const results = await store.listReleases();
          expect(results.length).toBe(50);
        });

        it('should limit results', async () => {

          const releases = [];
          for (var i = 0; i < 51; i++) {
            releases.push({
              data: makeRelease(),
              meta: makeMeta(),
            });
          }

          await Promise.all(releases.map(async release => {
            await store.saveRelease(release.data, release.meta);
          }));

          const results = await store.listReleases(10, 0);
          expect(results.length).toBe(10);
        });

        it('should page results', async () => {

          const releases = [];
          for (var i = 0; i < 51; i++) {
            releases.push({
              data: makeRelease(),
              meta: makeMeta(),
            });
          }

          await Promise.all(releases.map(async release => {
            await store.saveRelease(release.data, release.meta);
          }));

          const results = await store.listReleases(50, 10);
          expect(results.length).toBe(41);
        });

      });
    });
  });
});
