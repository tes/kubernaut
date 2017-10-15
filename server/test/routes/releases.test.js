import fs from 'fs';
import path from 'path';
import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logging/human';
import kubernetes from '../../lib/components/kubernetes/kubernetes-stub';
import { makeRelease, makeMeta, } from '../factories';

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
    .set('transports.human', human(loggerOptions))
    .start((err, components) => {
      if (err) return cb(err);
      config = components.config;
      store = components.store;
      cb();
    });
  });

  afterEach(() => {
    loggerOptions.suppress = false;
    manifests.length = 0;
  });

  afterAll(cb => {
    system.stop(cb);
  });

  describe('GET /api/releases', () => {

    beforeAll(async done => {

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

      done();
    });

    it('should return a list of releases', async done => {

      const releases = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'GET',
        json: true,
      });

      expect(releases.length).toBe(50);
      done();
    });

    it('should limit results', async done => {

      const releases = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(releases.length).toBe(40);
      done();
    });

    it('should page results', async done => {

      const releases = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });

      expect(releases.length).toBe(41);
      done();
    });

  });

  describe('GET /api/releases/:id', () => {

    it('should return the requested release', async done => {

      const data = makeRelease();
      await store.saveRelease(data, makeMeta());

      const release = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${data.id}`,
        method: 'GET',
        json: true,
      });

      expect(release.id).toBe(data.id);
      done();
    });

    it('should return 404 for missing releases', async done => {

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/does-not-exist`,
        method: 'GET',
        resolveWithFullResponse: true,
        json: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
        done();
      });
    });
  });

  describe('POST /api/releases', () => {

    it('should save a release', async done => {

      const data = makeRelease();

      const formData = {
        name: data.name,
        version: data.version,
        image: data.attributes.image,
        template: {
          value:  fs.createReadStream(path.join(__dirname, 'data', 'kubernetes.yaml')),
          options: {
            filename: 'kubernetes.yaml',
            contentType: 'application/x-yaml',
          },
        },
      };

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

      done();
    });

    it('should apply the kubernetes manifest template', async done => {

      const data = makeRelease();

      const formData = {
        name: data.name,
        version: data.version,
        image: data.attributes.image,
        template: {
          value:  fs.createReadStream(path.join(__dirname, 'data', 'kubernetes.yaml')),
          options: {
            filename: 'kubernetes.yaml',
            contentType: 'application/x-yaml',
          },
        },
      };

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        resolveWithFullResponse: true,
        formData,
      });

      expect(manifests.length).toBe(1);
      expect(manifests[0].length).toBe(3);
      expect(manifests[0][2].spec.template.spec.containers[0].image).toBe(formData.image);
      done();
    });

  });

  describe('DELETE /api/releases/:id', () => {

    it('should delete releases', async done => {

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
        done();
      });
    });

    it('should tolerate repeated deletions', async done => {

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
      done();
    });

    it('should tolerate deletion of missing releases', async done => {

      const data = makeRelease();
      await store.saveRelease(data, makeMeta());

      const response1 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/does-not-exist`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response1.statusCode).toBe(202);
      done();
    });
  });
});
