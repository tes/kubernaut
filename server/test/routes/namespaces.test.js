import expect from 'expect';
import request from 'request-promise';
import errors from 'request-promise/errors';
import { v4 as uuid } from 'uuid';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeCluster, makeNamespace, makeRelease, makeRootMeta } from '../factories';

describe('Namespaces API', () => {

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

  describe('GET /api/namespaces', () => {

    beforeEach(async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());

      const namespaces = [];
      for (var i = 0; i < 51; i++) {
        namespaces.push({
          data: makeNamespace({ cluster }),
          meta: makeRootMeta(),
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
        qs: { limit: 40, offset: 0 },
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
        qs: { limit: 50, offset: 10 },
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
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const data = makeNamespace({ cluster });
      const saved = await store.saveNamespace(data, makeRootMeta());

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

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const data = makeNamespace({ name: 'other', cluster, context: 'test' });

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

    it('should save a namespace with a color', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const data = makeNamespace({ name: 'other', cluster, context: 'test' });

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        json: {
          name: data.name,
          cluster: data.cluster.name,
          context: data.context,
          color: 'black',
        },
      });

      expect(response.id).toBeDefined();

      const namespace = await store.getNamespace(response.id);

      expect(namespace).toBeDefined();
      expect(namespace.name).toBe(data.name);
      expect(namespace.context).toBe(data.context);
      expect(namespace.color).toBe('black');
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

      await store.saveCluster(makeCluster({ name: 'Test' }), makeRootMeta());

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

      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test' }), makeRootMeta());

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

    it('should reject payloads where color is invalid', async () => {
      loggerOptions.suppress = true;

      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test' }), makeRootMeta());
      const data = makeNamespace({ name: 'other', cluster, context: 'test' });

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: data.name,
          cluster: cluster.name,
          context: data.context,
          color: 'foo',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('Unable to verify color');
      });
    });

  });

  describe('POST /api/namespaces/:id', () => {
    it('should update a namespace', async () => {
      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test' }), makeRootMeta());
      const data = makeNamespace({ cluster, color: 'black' });
      const saved = await store.saveNamespace(data, makeRootMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${saved.id}`,
        method: 'POST',
        json: {
          color: 'aliceblue',
        },
      });
      expect(response).toBeDefined();
      expect(response.id).toBe(saved.id);
      expect(response.color).toBe('aliceblue');
    });

    it('should update a namespace\'s attributes', async () => {
      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test' }), makeRootMeta());
      const data = makeNamespace({ cluster, attributes: { a: '1', b: '2' } });
      const saved = await store.saveNamespace(data, makeRootMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${saved.id}`,
        method: 'POST',
        json: {
          attributes: {
            a: '2',
          }
        },
      });
      expect(response).toBeDefined();
      expect(response.id).toBe(saved.id);
      expect(response.attributes).toMatchObject({
        a: '2',
      });
      expect(response.attributes.b).toBeUndefined();
    });

    it('should return bad request for missing namespace', async () => {
      const id = uuid();
      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${id}`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          color: 'aliceblue',
        },
      }).then(() => {
        throw new Error('Should have errored with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
        expect(reason.response.body.message).toBe(`namespace ${id} was not found`);
      });
    });

    it('should return bad request for an invalid color', async () => {
      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test' }), makeRootMeta());
      const data = makeNamespace({ cluster, color: 'black' });
      const saved = await store.saveNamespace(data, makeRootMeta());

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${saved.id}`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          color: 'notacolor',
        },
      }).then(() => {
        throw new Error('Should have errored with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe(`Unable to verify color`);
      });
    });

    it('should return bad request for an invalid cluster', async () => {
      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test' }), makeRootMeta());
      const data = makeNamespace({ cluster, color: 'black' });
      const saved = await store.saveNamespace(data, makeRootMeta());
      const invalidClusterId = uuid();

      loggerOptions.suppress = true;
      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${saved.id}`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          cluster: invalidClusterId,
        },
      }).then(() => {
        throw new Error('Should have errored with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe(`cluster ${invalidClusterId} was not found`);
      });
    });

    it('should return bad request for an invalid context', async () => {
      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test' }), makeRootMeta());
      const data = makeNamespace({ cluster, color: 'black' });
      const saved = await store.saveNamespace(data, makeRootMeta());
      const invalidContext = 'notacontext';

      loggerOptions.suppress = true;
      await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/${saved.id}`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          context: invalidContext,
        },
      }).then(() => {
        throw new Error('Should have errored with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe(`context ${invalidContext} was not found on ${cluster.name} cluster`);
      });
    });
  });

  describe('DELETE /api/namespaces/:id', () => {

    it('should delete namespaces', async () => {

      const cluster = await store.saveCluster(makeCluster({ name: 'Test', context: 'test' }), makeRootMeta());
      const data = makeNamespace({ cluster });
      const saved = await store.saveNamespace(data, makeRootMeta());

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

  describe('GET /api/namespaces/can-deploy-to-for/:serviceId', () => {
    it('should list namespaces for a service to deploy to', async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(await makeNamespace({
        cluster,
      }), makeRootMeta());
      await store.saveNamespace(await makeNamespace({
        cluster,
      }), makeRootMeta());

      const release = await store.saveRelease(makeRelease(), makeRootMeta());

      await store.enableServiceForNamespace(namespace, release.service, makeRootMeta());

      const namespaces = await request({
        url: `http://${config.server.host}:${config.server.port}/api/namespaces/can-deploy-to-for/${release.service.id}`,
        method: 'GET',
        json: true,
      });

      expect(namespaces).toBeDefined();
      expect(namespaces.count).toBe(1);
      expect(namespaces.items[0].id).toBe(namespace.id);
    });
  });
});
