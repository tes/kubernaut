import createSystem from '../test-system';
import postgres from '../../lib/components/stores/postgres';
import { makeProfile, makeMeta, } from '../factories';

describe('Profile Store', () => {

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
        .remove('store.profile')
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

      describe('Save Profile', () => {

        it('should create a profile', async () => {
          await store.saveProfile(makeProfile(), makeMeta());
        });

        it('should prevent duplicate profile versions', async () => {
          const data = makeProfile({
            name: 'duplicate-profile-version',
            version: '123',
          });
          await store.saveProfile(data, makeMeta());
          await expect(store.saveProfile(data, makeMeta())).rejects.toHaveProperty('code', '23505');
        });

        it('should permit multiple profile versions', async () => {
          const data1 = makeProfile({ name: 'multiple-profile-versions', version: '1', });
          await store.saveProfile(data1, makeMeta());

          const data2 = makeProfile({ name: 'multiple-profile-versions', version: '2', });
          await store.saveProfile(data2, makeMeta());
        });

      });

      describe('Get Profile', () => {

        it('should retrieve profiles by id', async () => {

          const data = makeProfile();
          const meta = makeMeta({ date: new Date(), user: 'cressie176', });
          const saved = await store.saveProfile(data, meta);
          const profile = await store.getProfile(saved.id);

          expect(profile).toBeDefined();
          expect(profile.id).toBe(saved.id);
          expect(profile.name).toBe(saved.name);
          expect(profile.version).toBe(data.version);
          expect(profile.createdOn.toISOString()).toBe(meta.date.toISOString());
          expect(profile.createdBy).toBe(meta.user);
          expect(profile.attributes.limit_memory).toBe(data.attributes.limit_memory);
          expect(profile.attributes.limit_cpu).toBe(data.attributes.limit_cpu);
        });

        it('should return undefined when profile not found', async () => {
          const profile = await store.getProfile('missing');
          expect(profile).toBe(undefined);
        });
      });

      describe('Delete Profile', () => {

        it('should soft delete profile', async () => {

          const data = makeProfile();
          await store.saveProfile(data, makeMeta());

          await store.deleteProfile(data.id, makeMeta());
          const profile = await store.getProfile(data.id);

          expect(profile).toBe(undefined);
        });

      });

      xdescribe('List Profile', () => {

        it('should list profiles, ordered by deletedOn desc, createdOn desc and id desc', async () => {

          const profiles = [
            {
              data: makeProfile({
                name: 'a',
                version: '1',
              }),
              meta: makeMeta({ user: 'third', date: new Date('2014-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeProfile({
                name: 'a',
                version: '2',
              }),
              meta: makeMeta({ user: 'second', date: new Date('2015-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeProfile({
                name: 'a',
                version: '3',
              }),
              meta: makeMeta({ user: 'fourth', date: new Date('2013-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeProfile({
                name: 'b',
                version: '1',
              }),
              meta: makeMeta({ user: 'first', date: new Date('2016-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeProfile({
                name: 'c',
                version: '1',
              }),
              meta: makeMeta({ user: 'sixth', date: new Date('2011-07-01T10:11:12.000Z'), }),
            },
            {
              data: makeProfile({
                name: 'c',
                version: '2',
              }),
              meta: makeMeta({ user: 'fifth', date: new Date('2012-07-01T10:11:12.000Z'), }),
            },
          ];

          await Promise.all(profiles.map(async profile => {
            await store.saveProfile(profile.data, profile.meta);
          }));

          const results = await store.listProfiles();
          const users = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth',];
          expect(results.length).toBe(users.length);
          users.forEach((user, index) => {
            expect(results[index].createdBy).toBe(user);
          });

        });

        it('should return slim profile', async () => {
          await store.saveProfile(makeProfile(), makeMeta());

          const profiles = await store.listProfiles();
          expect(profiles.length).toBe(1);
          expect(profiles[0].template).toBe(undefined);
          expect(Object.keys(profiles[0].attributes).length).toBe(0);
        });

        it('should limit results to 50 by default', async () => {

          const profiles = [];
          for (var i = 0; i < 51; i++) {
            profiles.push({
              data: makeProfile(),
              meta: makeMeta(),
            });
          }

          await Promise.all(profiles.map(async profile => {
            await store.saveProfile(profile.data, profile.meta);
          }));

          const results = await store.listProfiles();
          expect(results.length).toBe(50);
        });

        it('should limit results', async () => {

          const profiles = [];
          for (var i = 0; i < 51; i++) {
            profiles.push({
              data: makeProfile(),
              meta: makeMeta(),
            });
          }

          await Promise.all(profiles.map(async profile => {
            await store.saveProfile(profile.data, profile.meta);
          }));

          const results = await store.listProfiles(10, 0);
          expect(results.length).toBe(10);
        });

        it('should page results', async () => {

          const profiles = [];
          for (var i = 0; i < 51; i++) {
            profiles.push({
              data: makeProfile(),
              meta: makeMeta(),
            });
          }

          await Promise.all(profiles.map(async profile => {
            await store.saveProfile(profile.data, profile.meta);
          }));

          const results = await store.listProfiles(50, 10);
          expect(results.length).toBe(41);
        });

      });
    });
  });
});
