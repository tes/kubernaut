import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logging/human';
import kubernetes from '../../lib/components/kubernetes/kubernetes-stub';
import { makeProfile, makeMeta, } from '../factories';

describe('Profiles API', () => {

  let config;
  let system = { stop: cb => cb(), };
  let store = { nuke: new Promise(cb => cb()), };

  const loggerOptions = {};
  const manifests = [];

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13002, }, })
    .set('manifests', manifests)
    .set('kubernetes', kubernetes()).dependsOn('manifests')
    .set('transports.human', human(loggerOptions)).dependsOn('config')
    .start((err, components) => {
      if (err) return cb(err);
      config = components.config;
      store = components.store;
      cb();
    });
  });

  beforeEach(cb => {
    store.nuke().then(cb);
  });

  afterEach(() => {
    loggerOptions.suppress = false;
    manifests.length = 0;
  });

  afterAll(cb => {
    system.stop(cb);
  });

  describe('GET /api/profiles', () => {

    beforeEach(async () => {

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
    });

    it('should return a list of profiles', async () => {

      const profiles = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles`,
        method: 'GET',
        json: true,
      });

      expect(profiles.length).toBe(50);
    });

    it('should limit results', async () => {

      const profiles = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(profiles.length).toBe(40);
    });

    it('should page results', async () => {

      const profiles = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });

      expect(profiles.length).toBe(41);
    });

  });

  describe('GET /api/profiles/:id', () => {

    it('should return the requested profile', async () => {

      const data = makeProfile();
      const saved = await store.saveProfile(data, makeMeta());

      const profile = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(profile.id).toBe(saved.id);
    });

    it('should return 404 for missing profiles', async () => {

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles/does-not-exist`,
        method: 'GET',
        resolveWithFullResponse: true,
        json: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
      });
    });
  });

  describe('POST /api/profiles', () => {

    it('should save a profile', async () => {

      const json = makeProfile();

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles`,
        method: 'POST',
        resolveWithFullResponse: true,
        json,
      });

      const profile = response.body;

      expect(profile.id).toBeDefined();

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles/${profile.id}`,
        method: 'GET',
        json: true,
      });

    });

    it('should reject profiles without a name', async () => {

      const json = makeProfile();
      delete json.name;

      loggerOptions.suppress = true;

      await expect(request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles`,
        method: 'POST',
        json,
      })).rejects.toHaveProperty('statusCode', 400);

    });

    it('should reject profiles without a version', async () => {

      const json = makeProfile();
      delete json.version;

      loggerOptions.suppress = true;

      await expect(request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles`,
        method: 'POST',
        json,
      })).rejects.toHaveProperty('statusCode', 400);

    });

  });

  describe('DELETE /api/profiles/:id', () => {

    it('should delete profiles', async () => {

      const data = makeProfile();
      await store.saveProfile(data, makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles/${data.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(202);

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles/${data.id}`,
        method: 'GET',
        resolveWithFullResponse: true,
        json: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
      });
    });

    it('should tolerate repeated deletions', async () => {

      const data = makeProfile();
      await store.saveProfile(data, makeMeta());

      const response1 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles/${data.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response1.statusCode).toBe(202);

      const response2 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles/${data.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response2.statusCode).toBe(202);
    });

    it('should tolerate deletion of missing profiles', async () => {

      const data = makeProfile();
      await store.saveProfile(data, makeMeta());

      const response1 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/profiles/does-not-exist`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response1.statusCode).toBe(202);
    });
  });
});
