import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeCluster, makeNamespace, makeMeta, } from '../factories';

describe('Namespaces API', () => {

  let config;
  let system = { stop: cb => cb(), };
  let store = { nuke: new Promise(cb => cb()), };

  const loggerOptions = {};

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13004, }, })
    .set('transports.human', human(loggerOptions)).dependsOn('config')
    .start((err, components) => {
      if (err) return cb(err);
      config = components.config;
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

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  afterAll(cb => {
    system.stop(cb);
  });

  describe('GET /api/namespaces', () => {

    beforeEach(async () => {

      const cluster = await store.saveCluster(makeCluster(), makeMeta());

      const namespaces = [];
      for (var i = 0; i < 51; i++) {
        namespaces.push({
          data: makeNamespace({ cluster, }),
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

      expect(namespaces.count).toBe(51);
      expect(namespaces.offset).toBe(0);
      expect(namespaces.limit).toBe(50);
      expect(namespaces.items.length).toBe(50);
    });

    it('should limit namespaces list', async () => {

      const namespaces = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(namespaces.count).toBe(51);
      expect(namespaces.offset).toBe(0);
      expect(namespaces.limit).toBe(40);
      expect(namespaces.items.length).toBe(40);
    });

    it('should page namespaces list', async () => {

      const namespaces = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });

      expect(namespaces.count).toBe(51);
      expect(namespaces.offset).toBe(10);
      expect(namespaces.limit).toBe(50);
      expect(namespaces.items.length).toBe(41);
    });

  });

  describe('GET /api/namespaces/:id', () => {

    it('should return the requested namespace', async () => {

      const cluster = store.saveCluster(makeCluster(), makeMeta());
      const data = makeNamespace({ cluster, });
      const saved = await store.saveNamespace(data, makeMeta());

      const namespace = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(namespace.id).toBe(saved.id);
    });

    it('should return 403 for missing namespaces', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/does-not-exist`,
        method: 'GET',
        resolveWithFullResponse: true,
        json: true,
      }).then(() => {
        throw new Error('Should have failed with 403');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(403);
      });
    });
  });

  describe('POST /api/namespaces', () => {

    it('should save a namespace', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeMeta());
      const data = makeNamespace({ name: 'other', cluster, context: 'test', });

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        json: {
          name: data.name,
          cluster: data.cluster.name,
          context: data.context,
        },
      });

      expect(response.id).toBeDefined();

      const namespace = await store.getNamespace(response.id);

      expect(namespace).toBeDefined();
      expect(namespace.name).toBe(data.name);
      expect(namespace.context).toBe(data.context);
    });

    it('should reject payloads without a name', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          cluster: 'Test',
          context: 'test',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('name is required');
      });
    });

    it('should reject payloads without a context', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: 'foo',
          cluster: 'Test',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('context is required');
      });
    });

    it('should reject payloads without a cluster', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: 'foo',
          context: 'test',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('cluster is required');
      });
    });

    it('should reject payloads where cluster cannot be found', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: 'foo',
          cluster: 'missing',
          context: 'test',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('cluster missing was not found');
      });
    });

    it('should reject payloads where context cannot be found', async () => {

      await store.saveCluster(makeCluster({ name: 'Test', }), makeMeta());

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: 'foo',
          cluster: 'Test',
          context: 'missing',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('context missing was not found on Test cluster');
      });
    });

    it('should reject payloads where namespace cannot be found', async () => {

      loggerOptions.suppress = true;

      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test', }), makeMeta());

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: 'missing',
          cluster: cluster.name,
          context: 'test',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('namespace missing was not found on Test cluster');
      });
    });

  });

  describe('DELETE /api/namespaces/:id', () => {

    it('should delete namespaces', async () => {

      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test', }), makeMeta());
      const data = makeNamespace({ cluster, });
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
