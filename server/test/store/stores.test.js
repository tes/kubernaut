import createSystem from '../test-system';
import pg from 'systemic-pg';
import migrator from '../../lib/components/store/migrator';
import store from '../../lib/components/store/real';
import { makeRelease, makeMeta, } from '../factories';

describe('Store', () => {

  const suites = [
    {
      name: 'Fake',
      describe: describe,
      system: createSystem()
        .remove('server'),
    },
    {
      name: 'Real',
      describe: describe,
      system: createSystem()
        .remove('server')
        .set('migrator', migrator()).dependsOn({ component: 'config', source: 'postgres', destination: 'config.postgres', })
        .set('postgres', pg()).dependsOn('config', 'logger', 'migrator')
        .set('store', store()).dependsOn('config', 'logger', 'postgres'),
    },
  ];

  suites.forEach(suite => {

    suite.describe(`${suite.name} Store`, () => {

      let system = { stop: cb => cb(), };
      let store = { nuke: new Promise(cb => cb()), };

      beforeAll(cb => {
        system = suite.system.start((err, components) => {
          if (err) return cb(err);
          store = components.store;
          cb();
        });
      });

      afterEach(cb => {
        store.nuke().then(cb);
      });

      afterAll(cb => {
        system.stop(cb);
      });

      describe('Save release', () => {

        it('should create a release', async (done) => {
          await store.saveRelease(makeRelease(), makeMeta());
          done();
        });

        it('should prevent duplicate release ids', async (done) => {

          const data1 = makeRelease({ id: 'duplicate-release-id', });
          await store.saveRelease(data1, makeMeta());

          const data2 = makeRelease({ id: 'duplicate-release-id', });
          await expect(store.saveRelease(data2, makeMeta())).rejects.toHaveProperty('code', '23505');

          done();
        });

        it('should prevent duplicate release versions', async (done) => {

          const data1 = makeRelease({ name: 'duplicate-release-version', version: '123', });
          await store.saveRelease(data1, makeMeta());

          const data2 = makeRelease({ name: 'duplicate-release-version', version: '123', });
          await expect(store.saveRelease(data2, makeMeta())).rejects.toHaveProperty('code', '23505');

          done();
        });

        it('should permit multiple release versions', async (done) => {

          const data1 = makeRelease({ id: 'multiple-release-version-1', name: 'multiple-release-versions', version: '1', });
          await store.saveRelease(data1, makeMeta());

          const data2 = makeRelease({ id: 'multiple-release-version-2', name: 'multiple-release-versions', version: '2', });
          await store.saveRelease(data2, makeMeta());

          done();
        });

      });

      describe('Get Release', () => {

        it('should retrieve releases by id', async (done) => {

          const data = makeRelease();
          const meta = makeMeta({ date: new Date(), user: 'cressie176', });
          await store.saveRelease(data, meta);
          const release = await store.getRelease(data.id);

          expect(release).toBeDefined();
          expect(release.id).toBe(data.id);
          expect(release.name).toBe(data.name);
          expect(release.version).toBe(data.version);
          expect(release.template).toBe(data.template);
          expect(release.description).toBe(data.description);
          expect(release.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(release.createdBy).toBe(meta.user);
          expect(release.attributes.TEMPLATE).toBe(data.attributes.TEMPLATE);
          expect(release.attributes.IMAGE).toBe(data.attributes.IMAGE);

          done();
        });

        it('should return undefined when release not found', async (done) => {
          const release = await store.getRelease('missing');
          expect(release).toBe(undefined);
          done();
        });
      });

      describe('Delete Release', () => {

        it('should soft delete release', async (done) => {

          const data = makeRelease();
          await store.saveRelease(data, makeMeta());

          await store.deleteRelease(data.id, makeMeta());
          const release = await store.getRelease(data.id);

          expect(release).toBe(undefined);

          done();
        });

      });


      describe('List Releases', () => {

        it('should list releases, ordered by deletedOn desc, createdOn desc and id desc', async (done) => {

          const releases = [
            {
              data: makeRelease({ id: 'third', name: 'a', version: '1', }),
              meta: makeMeta({ date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({ id: 'second', name: 'a', version: '2', }),
              meta: makeMeta({ date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({ id: 'fourth', name: 'a', version: '3', }),
              meta: makeMeta({ date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({ id: 'first', name: 'b', version: '1', }),
              meta: makeMeta({ date: new Date('2016-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({ id: 'sixth', name: 'c', version: '1', }),
              meta: makeMeta({ date: new Date('2011-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeRelease({ id: 'fifth', name: 'c', version: '2', }),
              meta: makeMeta({ date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(releases.map(async release => {
            await store.saveRelease(release.data, release.meta);
          }));

          const results = await store.listReleases();
          const ids = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth',];
          expect(results.length).toBe(ids.length);
          ids.forEach((id, index) => {
            expect(results[index].id).toBe(id);
          });

          done();
        });

        it('should return slim release', async (done) => {
          await store.saveRelease(makeRelease(), makeMeta());

          const releases = await store.listReleases();
          expect(releases.length).toBe(1);
          expect(releases[0].template).toBe(undefined);
          expect(Object.keys(releases[0].attributes).length).toBe(0);

          done();
        });

        it('should limit results to 50 by default', async (done) => {

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

          done();
        });

        it('should limit results', async (done) => {

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

          done();
        });

        it('should page results', async (done) => {

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

          done();
        });

      });
    });
  });
});
