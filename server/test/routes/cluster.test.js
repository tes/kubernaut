import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeCluster, makeRootMeta, } from '../factories';

describe('Clusters API', () => {

  let config;
  let system = { stop: cb => cb(), };
  let store = { nuke: new Promise(cb => cb()), };
  let kubernetes = { nuke: new Promise(cb => cb()), };

  const loggerOptions = {};

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13006, }, })
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
    await store.nuke();
    await kubernetes.nuke();
    cb();
  });

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  afterAll(async cb => {
    await store.nuke();
    system.stop(cb);
  });

  describe('GET /api/clusters', () => {

    beforeEach(async () => {

      const clusters = [];
      for (var i = 0; i < 51; i++) {
        clusters.push({
          data: makeCluster(),
          meta: makeRootMeta(),
        });
      }

      await Promise.all(clusters.map(async cluster => {
        await store.saveCluster(cluster.data, cluster.meta);
      }));
    });

    it('should return a list of clusters', async () => {
      const clusters = await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters`,
        method: 'GET',
        json: true,
      });

      expect(clusters.count).toBe(51);
      expect(clusters.offset).toBe(0);
      expect(clusters.limit).toBe(50);
      expect(clusters.items.length).toBe(50);
    });

    it('should limit clusters list', async () => {

      const clusters = await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(clusters.count).toBe(51);
      expect(clusters.offset).toBe(0);
      expect(clusters.limit).toBe(40);
      expect(clusters.items.length).toBe(40);
    });

    it('should page clusters list', async () => {

      const clusters = await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });

      expect(clusters.count).toBe(51);
      expect(clusters.offset).toBe(10);
      expect(clusters.limit).toBe(50);
      expect(clusters.items.length).toBe(41);
    });

  });

  describe('GET /api/clusters/:id', () => {

    it('should return the requested cluster', async () => {

      const data = makeCluster();
      const saved = await store.saveCluster(data, makeRootMeta());

      const cluster = await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(cluster.id).toBe(saved.id);
    });

    it('should return 404 for missing clusters', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters/142bc001-1819-459b-bf95-14e25be17fe5`,
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

  describe('POST /api/clusters', () => {

    it('should save a cluster', async () => {

      const data = makeCluster({
        config: __filename,
      });

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters`,
        method: 'POST',
        json: data,
      });

      expect(response.id).toBeDefined();

      const cluster = await store.getCluster(response.id);

      expect(cluster).toBeDefined();
      expect(cluster.name).toBe(data.name);
      expect(cluster.config).toBe(data.config);
    });

    it('should reject payloads without a name', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          config: __filename,
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('name is required');
      });
    });

    it('should reject payloads without a config', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: 'foo',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('config is required');
      });
    });

    it('should reject payloads missing config', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: 'foo',
          config: 'does-not-exist-123123123',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('Config does-not-exist-123123123 was not found');
      });
    });
  });

  describe('DELETE /api/clusters/:id', () => {

    it('should delete clusters', async () => {

      const data = makeCluster();
      const saved = await store.saveCluster(data, makeRootMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/clusters/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);

      const cluster = await store.getCluster(saved.id);
      expect(cluster).toBe(undefined);
    });
  });
});
