import expect from 'expect';
import request from 'request-promise';
import errors from 'request-promise/errors';
import fs from 'fs';
import path from 'path';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeRelease, makeRootMeta, makeReleaseForm } from '../factories';

describe('Releases API', () => {

  let config;
  let system = { stop: cb => cb() };
  let store = { nuke: new Promise(cb => cb()) };

  const loggerOptions = {};

  before(async () => {
    system = createSystem()
      .set('transports.human', human(loggerOptions)).dependsOn('config');

    const components = await system.start();
    config = components.config;
    store = components.store;
  });

  beforeEach(async () => {
    await store.nuke();
  });

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });

  describe('GET /api/releases', () => {

    beforeEach(async () => {

      await store.nuke();

      const releases = [];
      for (var i = 0; i < 51; i++) {
        releases.push({
          data: makeRelease(),
          meta: makeRootMeta(),
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

      expect(releases.count).toBe(51);
      expect(releases.offset).toBe(0);
      expect(releases.limit).toBe(50);
      expect(releases.items.length).toBe(50);
    });

    it('should limit releases list', async () => {

      const releases = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
        json: true,
      });

      expect(releases.count).toBe(51);
      expect(releases.offset).toBe(0);
      expect(releases.limit).toBe(40);
      expect(releases.items.length).toBe(40);
    });

    it('should page results', async () => {

      const releases = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
        json: true,
      });

      expect(releases.count).toBe(51);
      expect(releases.offset).toBe(10);
      expect(releases.limit).toBe(50);
      expect(releases.items.length).toBe(41);
    });

  });

  describe('GET /api/releases/:id', () => {

    it('should return the requested release', async () => {

      const data = makeRelease();
      const saved = await store.saveRelease(data, makeRootMeta());

      const release = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(release.id).toBe(saved.id);
    });

    it('should return 404 for missing releases', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/142bc001-1819-459b-bf95-14e25be17fe5`,
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

      const formData = makeReleaseForm();

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        resolveWithFullResponse: true,
        formData,
      });

      const id = JSON.parse(response.body).id;
      expect(id).toBeDefined();

      const release = await store.getRelease(id);

      expect(release).toBeDefined();
      expect(release.service.name).toBe(formData.service);
      expect(release.service.registry.name).toBe(formData.registry);
      expect(release.version).toBe(formData.version);
      expect(release.template.source.yaml).toBeDefined();
      expect(release.template.source.json).toBeDefined();
      expect(release.template.checksum).toBe('bd4263ef8d1353b0');
      expect(release.attributes.image).toBe(formData.image);
    });

    it('should reject payloads without a registry', async () => {

      const formData = makeReleaseForm();
      delete formData.registry;

      loggerOptions.suppress = true;

      await expect(request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        formData,
      })).rejects.toHaveProperty('statusCode', 400);
    });

    it('should reject payloads without a service', async () => {

      const formData = makeReleaseForm();
      delete formData.service;

      loggerOptions.suppress = true;

      await expect(request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        formData,
      })).rejects.toHaveProperty('statusCode', 400);
    });

    it('should reject payloads without a version', async () => {

      const formData = makeReleaseForm();
      delete formData.version;

      loggerOptions.suppress = true;

      await expect(request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        formData,
      })).rejects.toHaveProperty('statusCode', 400);
    });

    it('should reject payloads with invalid template', async () => {

      const templatePath = path.join('server', 'test', 'factories', 'data', 'invalid-template.yaml');

      const formData = makeReleaseForm({
        template: {
          value: fs.createReadStream(templatePath),
        },
      });
      loggerOptions.suppress = true;

      await expect(request({
        url: `http://${config.server.host}:${config.server.port}/api/releases`,
        method: 'POST',
        formData,
      })).rejects.toHaveProperty('statusCode', 400);
    });

    it('should reject payloads with invalid manifest', async () => {

      const templatePath = path.join('server', 'test', 'factories', 'data', 'invalid-manifest.yaml');

      const formData = makeReleaseForm({
        template: {
          value: fs.createReadStream(templatePath),
        },
      });
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
      const saved = await store.saveRelease(data, makeRootMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/releases/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);

      const release = await store.getRelease(saved.id);
      expect(release).toBe(undefined);
    });
  });
});
