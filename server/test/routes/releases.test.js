import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logging/human';
import kubernetes from '../../lib/components/kubernetes/kubernetes-stub';
import { makeRelease, makeMeta, makeFormData, } from '../factories';

describe('Releases API', () => {

  let config;
  let system = { stop: cb => cb(), };
  let store = { nuke: new Promise(cb => cb()), };

  const loggerOptions = {};
  const manifests = [];

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13001, }, })
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

  describe('GET /api/releases', () => {

    beforeEach(async () => {

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
    });

    it('should return a list of releases', async () => {

      const releases = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'GET',
        json: true,
      });

      expect(releases.length).toBe(50);
    });

    it('should limit results', async () => {

      const releases = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(releases.length).toBe(40);
    });

    it('should page results', async () => {

      const releases = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });

      expect(releases.length).toBe(41);
    });

  });

  describe('GET /api/releases/:id', () => {

    it('should return the requested release', async () => {

      const data = makeRelease();
      const saved = await store.saveRelease(data, makeMeta());

      const release = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(release.id).toBe(saved.id);
    });

    it('should return 404 for missing releases', async () => {

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/does-not-exist`,
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

  describe('POST /api/releases', () => {

    it('should save a release', async () => {

      const formData = makeFormData();

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        resolveWithFullResponse: true,
        formData,
      });

      const release = JSON.parse(response.body);

      expect(release.id).toBeDefined();

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${release.id}`,
        method: 'GET',
        json: true,
      });

    });

    it('should apply the kubernetes manifest template', async () => {

      const formData = makeFormData();

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        resolveWithFullResponse: true,
        formData,
      });

      expect(manifests.length).toBe(1);
      expect(manifests[0].length).toBe(3);
      expect(manifests[0][2].spec.template.spec.containers[0].image).toBe(formData.image);
    });

    it('should reject releases without a service', async () => {

      const formData = makeFormData();
      delete formData.service;

      loggerOptions.suppress = true;

      await expect(request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        formData,
      })).rejects.toHaveProperty('statusCode', 400);

    });

    it('should reject releases without a version', async () => {

      const formData = makeFormData();
      delete formData.version;

      loggerOptions.suppress = true;

      await expect(request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        formData,
      })).rejects.toHaveProperty('statusCode', 400);

    });

  });

  describe('DELETE /api/releases/:id', () => {

    it('should delete releases', async () => {

      const data = makeRelease();
      await store.saveRelease(data, makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${data.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(202);

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${data.id}`,
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

      const data = makeRelease();
      await store.saveRelease(data, makeMeta());

      const response1 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${data.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response1.statusCode).toBe(202);

      const response2 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${data.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response2.statusCode).toBe(202);
    });

    it('should tolerate deletion of missing releases', async () => {

      const data = makeRelease();
      await store.saveRelease(data, makeMeta());

      const response1 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/does-not-exist`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response1.statusCode).toBe(202);
    });
  });
});
