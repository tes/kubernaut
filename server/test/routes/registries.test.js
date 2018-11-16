import expect from 'expect';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import {
  makeRegistry,
  makeRootMeta,
  makeRelease,
  makeRequestWithDefaults,
} from '../factories';

describe('Registries API', () => {

  let request;
  let config;
  let system = { stop: cb => cb() };
  let store = { nuke: new Promise(cb => cb()) };

  const loggerOptions = {};

  before(async () => {
    system = createSystem()
      .set('transports.human', human(loggerOptions)).dependsOn('config');

    ({ config, store } = await system.start());
    request = makeRequestWithDefaults(config);
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

  describe('GET /api/registries', () => {

    beforeEach(async () => {

      const registries = [];
      for (var i = 0; i < 51; i++) {
        registries.push({
          data: makeRegistry(),
          meta: makeRootMeta(),
        });
      }

      await Promise.all(registries.map(async registry => {
        await store.saveRegistry(registry.data, registry.meta);
      }));
    });

    it('should return a list of registries', async () => {
      const registries = await request({
        url: `/api/registries`,
        method: 'GET',
      });

      expect(registries.count).toBe(52);
      expect(registries.offset).toBe(0);
      expect(registries.limit).toBe(50);
      expect(registries.items.length).toBe(50);
    });

    it('should limit registries list', async () => {

      const registries = await request({
        url: `/api/registries`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
      });

      expect(registries.count).toBe(52);
      expect(registries.offset).toBe(0);
      expect(registries.limit).toBe(40);
      expect(registries.items.length).toBe(40);
    });

    it('should page namepaces list', async () => {

      const registries = await request({
        url: `/api/registries`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
      });

      expect(registries.count).toBe(52);
      expect(registries.offset).toBe(10);
      expect(registries.limit).toBe(50);
      expect(registries.items.length).toBe(42);
    });

  });

  describe('GET /api/registries/:id', () => {

    it('should return the requested registry', async () => {

      const data = makeRegistry();
      const saved = await store.saveRegistry(data, makeRootMeta());

      const registry = await request({
        url: `/api/registries/${saved.id}`,
        method: 'GET',
      });

      expect(registry.id).toBe(saved.id);
    });

    it('should return 404 for missing registries', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `/api/registries/11111111-1111-1111-1111-111111111111`, // non-existent uuid
        method: 'GET',
        resolveWithFullResponse: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
      });
    });
  });

  describe('POST /api/registries', () => {

    it('should save a registry', async () => {

      const data = makeRegistry();

      const response = await request({
        url: `/api/registries`,
        method: 'POST',
        json: data,
      });

      expect(response.id).toBeDefined();

      const registry = await store.getRegistry(response.id);

      expect(registry).toBeDefined();
      expect(registry.name).toBe(data.name);
    });

    it('should reject payloads without a name', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `/api/registries`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('name is required');
      });
    });

  });

  describe('DELETE /api/registries/:id', () => {

    it('should delete registries', async () => {

      const data = makeRegistry();
      const saved = await store.saveRegistry(data, makeRootMeta());

      const response = await request({
        url: `/api/registries/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
      });

      expect(response.statusCode).toBe(204);

      const registry = await store.getRegistry(saved.id);
      expect(registry).toBe(undefined);
    });
  });

  describe('GET /api/registries/:registry/search/:serviceName', () => {
    it('should search services and return names similar to provided string', async () => {
      const registry = await store.saveRegistry(makeRegistry(), makeRootMeta());
      await store.saveRelease(makeRelease({ service: { name: 'app-1', registry} }), makeRootMeta());
      await store.saveRelease(makeRelease({ service: { name: 'app-2', registry} }), makeRootMeta());
      await store.saveRelease(makeRelease({ service: { name: 'service-1', registry} }), makeRootMeta());

      const response = await request({
        url: `/api/registries/${registry.name}/search/app`,
        method: 'GET',
      });

      expect(response).toBeDefined();
      expect(response.length).toBe(2);
      expect(response[0].name).toBeDefined();
      expect(response[0].name).toBe('app-1');
      expect(response[1].name).toBeDefined();
      expect(response[1].name).toBe('app-2');
    });

    it('should return 404 for missing registries', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `/api/registries/does-not-exist/search/nothing`,
        method: 'GET',
        resolveWithFullResponse: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
      });
    });
  });
});
