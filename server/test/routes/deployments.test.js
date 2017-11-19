import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logging/human';
import kubernetes from '../../lib/components/kubernetes/kubernetes-stub';
import { makeDeployment, makeMeta, } from '../factories';

describe('Deployments API', () => {

  let config;
  let system = { stop: cb => cb(), };
  let store = { nuke: new Promise(cb => cb()), };

  const loggerOptions = {};
  const contexts = {
    test: {
      manifests: [],
    },
  };

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13002, }, })
    .set('contexts', contexts)
    .set('kubernetes', kubernetes()).dependsOn('contexts')
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
    contexts.test = { manifests: [], };
  });

  afterAll(cb => {
    system.stop(cb);
  });

  describe('GET /api/deployments', () => {

    beforeEach(async () => {
      const deployments = [];

      for (var i = 0; i < 51; i++) {
        deployments.push({
          data: makeDeployment(),
          meta: makeMeta(),
        });
      }

      await Promise.all(deployments.map(async record => {
        const release = await store.saveRelease(record.data.release, makeMeta());
        const deployment = { ...record.data, release, };
        await store.saveDeployment(deployment, record.meta);
      }));
    });

    it('should return a list of deployments', async () => {
      const deployments = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'GET',
        json: true,
      });

      expect(deployments.length).toBe(50);
    });

    it('should limit results', async () => {

      const deployments = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(deployments.length).toBe(40);
    });

    it('should page results', async () => {

      const deployments = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });

      expect(deployments.length).toBe(41);
    });

  });

  describe('GET /api/deployments/:id', () => {

    it('should return the requested deployment', async () => {

      const saved = await saveDeployment();

      const deployment = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(deployment.id).toBe(saved.id);
    });

    it('should return 404 for missing deployments', async () => {

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/does-not-exist`,
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

  describe('POST /api/deployments', () => {

    it('should save a deployment', async () => {

      const data = makeDeployment({
        release: {
          service: {
            name: 'foo',
          },
          version: '22',
        },
      });
      await store.saveRelease(data.release, makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        json: {
          context: 'test',
          service: 'foo',
          version: '22',
        },
      });

      expect(response.id).toBeDefined();

      const deployment = await store.getDeployment(response.id);

      expect(deployment).toBeDefined();
      expect(deployment.context).toBe('test');
      expect(deployment.manifest.yaml).toEqual(data.manifest.yaml);
      expect(deployment.manifest.json).toEqual(data.manifest.json);
      expect(deployment.release.service.name).toBe(data.release.service.name);
      expect(deployment.release.version).toBe(data.release.version);
    });

    it('should apply the kubernetes manifest', async () => {

      const data = makeDeployment({
        context: 'test',
        release: {
          attributes: {
            image: 'foo:22',
          },
        },
      });
      await store.saveRelease(data.release, makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        json: {
          context: data.context,
          service: data.release.service.name,
          version: data.release.version,
        },
      });

      expect(response.id).toBeDefined();

      expect(contexts.test.manifests.length).toBe(1);
      expect(contexts.test.manifests[0].length).toBe(3);
      expect(contexts.test.manifests[0][2].spec.template.spec.containers[0].image).toBe('foo:22');
    });

    it('should reject deployments without a context', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          service: 'foo',
          version: '22',
        },
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('context is required');
      });
    });

    it('should reject deployments without a service', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          context: 'test',
          version: '22',
        },
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('service is required');
      });
    });

    it('should reject deployments without a version', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          context: 'test',
          service: 'foo',
        },
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('version is required');
      });
    });

    it('should reject deployments without a matching release', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          context: 'test',
          service: 'foo',
          version: '22',
        },
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('Release foo/22 was not found');
      });
    });
  });

  describe('DELETE /api/deployments/:id', () => {

    it('should delete deployments', async () => {

      const saved = await saveDeployment();

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/${saved.id}`,
        method: 'GET',
        resolveWithFullResponse: true,
        json: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
      });
    });

    it('should tolerate repeated deployment deletions', async () => {

      const saved = await saveDeployment();

      const response1 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response1.statusCode).toBe(204);

      const response2 = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response2.statusCode).toBe(204);
    });

    it('should tolerate deletion of missing deployments', async () => {

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/does-not-exist`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);
    });
  });

  async function saveDeployment() {
      const data = makeDeployment();
      const release = await store.saveRelease(data.release, makeMeta());
      return await store.saveDeployment({ ...data, release, }, makeMeta());
  }

});

