import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeNamespace, makeMeta, } from '../factories';

describe('Namespaces API', () => {

  let config;
  let system = { stop: cb => cb(), };
  let store = { nuke: new Promise(cb => cb()), };
  let kubernetes = { nuke: new Promise(cb => cb()), };

  const loggerOptions = {};

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13004, }, })
    .set('transports.human', human(loggerOptions)).dependsOn('config')
    .start((err, components) => {
      if (err) return cb(err);
      config = components.config;
      store = components.store;
      kubernetes = components.kubernetes;
      cb();
    });
  });

  beforeEach(async cb => {
    try {
      await store.nuke();
      await kubernetes.nuke();
    } catch (err) {
      cb(err);
    }
    cb();
  });

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  afterAll(cb => {
    system.stop(cb);
  });

  describe('GET /api/namespaces', () => {

    beforeEach(async () => {

      const namespaces = [];
      for (var i = 0; i < 51; i++) {
        namespaces.push({
          data: makeNamespace(),
          meta: makeMeta(),
        });
      }

      await Promise.all(namespaces.map(async namespace => {
        await store.saveNamespace(namespace.data, namespace.meta);
      }));
    });

    it('should return a list of namespaces', async () => {
      const namespaces = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'GET',
        json: true,
      });

      expect(namespaces.length).toBe(50);
    });

    it('should limit results', async () => {

      const namespaces = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(namespaces.length).toBe(40);
    });

    it('should page results', async () => {

      const namespaces = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });

      expect(namespaces.length).toBe(42);
    });

  });

  describe('GET /api/namespaces/:id', () => {

    it('should return the requested namespace', async () => {

      const data = makeNamespace();
      const saved = await store.saveNamespace(data, makeMeta());

      const namespace = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(namespace.id).toBe(saved.id);
    });

    it('should return 404 for missing namespaces', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/does-not-exist`,
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

  describe('POST /api/namespaces', () => {

    it('should save a namespace', async () => {

      const data = makeNamespace();

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        json: data,
      });

      expect(response.id).toBeDefined();

      const namespace = await store.getNamespace(response.id);

      expect(namespace).toBeDefined();
      expect(namespace.name).toBe(data.name);
    });

    it('should reject payloads without a name', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
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

  describe('DELETE /api/namespaces/:id', () => {

    it('should delete namespaces', async () => {

      const data = makeNamespace();
      const saved = await store.saveNamespace(data, makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);

      const namespace = await store.getNamespace(saved.id);
      expect(namespace).toBe(undefined);
    });
  });
});
