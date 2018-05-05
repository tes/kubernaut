import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeRelease, makeCluster, makeNamespace, makeDeployment, makeRootMeta, } from '../factories';

describe('Deployments API', () => {

  let config;
  let system = { stop: cb => cb(), };
  let store = { nuke: new Promise(cb => cb()), };
  let kubernetes = { nuke: new Promise(cb => cb()), };

  const loggerOptions = {};

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13002, }, })
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

  describe('GET /api/deployments', () => {

    beforeEach(async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster, }), makeRootMeta());
      const deployments = [];

      for (var i = 0; i < 51; i++) {
        deployments.push({
          data: makeDeployment({ namespace, }),
          meta: makeRootMeta(),
        });
      }

      await Promise.all(deployments.map(async record => {
        const release = await store.saveRelease(record.data.release, makeRootMeta());
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

      expect(deployments.count).toBe(51);
      expect(deployments.offset).toBe(0);
      expect(deployments.limit).toBe(50);
      expect(deployments.items.length).toBe(50);
    });

    it('should limit deployments list', async () => {

      const deployments = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(deployments.count).toBe(51);
      expect(deployments.offset).toBe(0);
      expect(deployments.limit).toBe(40);
      expect(deployments.items.length).toBe(40);
    });

    it('should page deployments list', async () => {

      const deployments = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });

      expect(deployments.count).toBe(51);
      expect(deployments.offset).toBe(10);
      expect(deployments.limit).toBe(50);
      expect(deployments.items.length).toBe(41);
    });

  });

  describe('GET /api/deployments/:id', () => {

    it('should return the requested deployment', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster, }), makeRootMeta());
      const saved = await saveDeployment({ namespace, });

      const deployment = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(deployment.id).toBe(saved.id);
    });

    it('should return 404 for missing deployments', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/142bc001-1819-459b-bf95-14e25be17fe5`,
        method: 'GET',
        resolveWithFullResponse: true,
        json: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(404);
      });
    });
  });

  describe('POST /api/deployments', () => {

    it('should save a deployment', async () => {

      // const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      // const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test', }), makeRootMeta());
      //
      // const release = makeRelease({
      //   service: {
      //     name: 'release-1',
      //   },
      //   version: '22',
      // });
      // await store.saveRelease(release, makeRootMeta());
      //
      // const response = await request({
      //   url: `http://${config.server.host}:${config.server.port}/api/deployments`,
      //   method: 'POST',
      //   json: {
      //     namespace: namespace.name,
      //     cluster: cluster.name,
      //     registry: release.service.registry.name,
      //     service: release.service.name,
      //     version: release.version,
      //     replicas: 3,
      //   },
      // });
      //
      // expect(response.id).toBeDefined();
      // expect(response.status).toBe('pending');
      // expect(response.log.length).toBe(1);
      //
      // const deployment = await store.getDeployment(response.id);
      // expect(deployment).toBeDefined();
      // expect(deployment.namespace.id).toBe(namespace.id);
      // expect(deployment.namespace.cluster.id).toBe(cluster.id);
      // expect(deployment.manifest.yaml).toMatch(/image: "registry\/repo\/release-1:22"/);
      // expect(deployment.manifest.json[2].spec.replicas).toBe(3);
      // expect(deployment.manifest.json[2].spec.template.spec.containers[0].image).toBe('registry/repo/release-1:22');
      // expect(deployment.release.service.name).toBe(release.service.name);
      // expect(deployment.release.version).toBe(release.version);
      // expect(deployment.applyExitCode).toBe(0);
      // expect(deployment.rolloutStatusExitCode).toBe(null);
      // expect(deployment.log.length).toBe(1);
      // expect(deployment.attributes.replicas).toBe("3");
      //
      // console.log("SO FAR SO GOOD!!!!")
    });

    it('should report manifest compilation errors', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test', }), makeRootMeta());

      const release = makeRelease({
        template: {
          source: {
            yaml: '"{{#whatever}}"',
            json: {},
          },
        },
      });
      await store.saveRelease(release, makeRootMeta());

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        json: {
          namespace: namespace.name,
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: release.version,
        },
      }).then(() => {
        throw new Error('Should have failed with 500');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(500);
        expect(reason.response.body.message).toMatch(/missing closing tag: whatever/);
      });
    });

    it('should apply the kubernetes manifest', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test', }), makeRootMeta());

      const release = makeRelease({
        service: {
          name: 'release-1',
          namespace: {
            name: 'default',
          },
        },
        version: '22',
      });
      await store.saveRelease(release, makeRootMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        json: {
          namespace: namespace.name,
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: release.version,
          replicas: 3,
        },
      });

      expect(response.id).toBeDefined();

      expect(kubernetes.getContexts().test.namespaces.default.manifests.length).toBe(1);
      expect(kubernetes.getContexts().test.namespaces.default.manifests[0].length).toBe(3);
      expect(kubernetes.getContexts().test.namespaces.default.manifests[0][2].spec.template.spec.containers[0].image).toBe('registry/repo/release-1:22');
    });

    it('should report apply failure', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test', }), makeRootMeta());

      const release = makeRelease({
        service: {
          name: 'z-elease-1',
          namespace: {
            name: 'default',
          },
        },
        version: '22',
      });
      await store.saveRelease(release, makeRootMeta());

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        json: {
          namespace: namespace.name,
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: release.version,
          replicas: 3,
        },
      }).then(() => {
        throw new Error('Should have failed with 500');
      }).catch(errors.StatusCodeError, async reason => {
        expect(reason.response.statusCode).toBe(500);
        expect(reason.response.body.id).toBeDefined();
        expect(reason.response.body.status).toBe('failure');
        expect(reason.response.body.log.length).toBe(1);
      });
    });

    it('should wait for rollout', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test', }), makeRootMeta());
      const release = makeRelease();

      await store.saveRelease(release, makeRootMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        qs: {
          wait: 'true',
        },
        json: {
          namespace: namespace.name,
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: release.version,
          replicas: 3,
        },
      });

      expect(response.id).toBeDefined();
      expect(response.status).toBe('success');
      expect(response.log.length).toBe(3);

      const deployment = await store.getDeployment(response.id);
      expect(deployment.applyExitCode).toBe(0);
      expect(deployment.rolloutStatusExitCode).toBe(0);
      expect(deployment.log.length).toBe(3);
    });

    it('should report rollout failure', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test', }), makeRootMeta());
      const release = makeRelease({
        service: {
          name: 'x-release-1',
        },
      });

      await store.saveRelease(release, makeRootMeta());

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        qs: {
          wait: 'true',
        },
        resolveWithFullResponse: true,
        json: {
          namespace: namespace.name,
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: release.version,
          replicas: 3,
        },
      }).then(() => {
        throw new Error('Should have failed with 500');
      }).catch(errors.StatusCodeError, async reason => {
        expect(reason.response.statusCode).toBe(500);
        expect(reason.response.body.id).toBeDefined();
        expect(reason.response.body.status).toBe('failure');
        expect(reason.response.body.log.length).toBe(3);

        const deployment = await store.getDeployment(reason.response.body.id);
        expect(deployment.applyExitCode).toBe(0);
        expect(deployment.rolloutStatusExitCode).toBe(99);
        expect(deployment.log.length).toBe(3);
      });
    });

    it('should reject payloads without a cluster', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          namespace: 'foo',
          registry: 'bar',
          service: 'baz',
          version: '22',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('cluster is required');
      });
    });

    it('should reject payloads without a registry', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          namespace: 'foo',
          cluster: 'bar',
          service: 'baz',
          version: '22',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('registry is required');
      });
    });

    it('should reject payloads without a service', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          namespace: 'foo',
          cluster: 'bar',
          registry: 'baz',
          version: '22',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('service is required');
      });
    });

    it('should reject payloads without a namespace', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          cluster: 'foo',
          registry: 'bar',
          service: 'baz',
          version: '22',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('namespace is required');
      });
    });

    it('should reject payloads without a version', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          cluster: 'foo',
          namespace: 'bar',
          registry: 'baz',
          service: 'meh',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('version is required');
      });
    });

    it('should reject payloads a missing context (kubernetes)', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'missing', }), makeRootMeta());
      const release = makeRelease();
      await store.saveRelease(release, makeRootMeta());

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          namespace: namespace.name,
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: release.version,
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('context missing was not found');
      });
    });

    it('should reject payloads with a missing namespace (kubernetes)', async () => {

      const cluster = await store.saveCluster(makeCluster({ name: 'Test', }), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'missing', cluster, context: 'test', }), makeRootMeta());
      const release = makeRelease();
      await store.saveRelease(release, makeRootMeta());

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          namespace: namespace.name,
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: release.version,
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('namespace missing was not found in Test cluster');
      });
    });

    it('should reject payloads with a missing namespace (store)', async () => {

      const cluster = await store.saveCluster(makeCluster({ name: 'Test', }), makeRootMeta());
      const release = makeRelease();
      await store.saveRelease(release, makeRootMeta());

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          namespace: 'other',
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: release.version,
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('namespace other was not found');
      });
    });

    it('should reject payloads without a matching release', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster, }), makeRootMeta());
      const release = makeRelease({
        service: {
          name: 'foo',
        },
        version: '22',
      });

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          namespace: namespace.name,
          cluster: cluster.name,
          registry: release.service.registry.name,
          service: release.service.name,
          version: 'missing',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('release default/foo/missing was not found');
      });
    });

  });

  describe('DELETE /api/deployments/:id', () => {

    it('should delete deployments', async () => {

      const cluster = await store.saveCluster(makeCluster({ name: 'Test', }), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test', }), makeRootMeta());
      const saved = await saveDeployment({ namespace, });

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);

      const deployment = await store.getDeployment(saved.id);
      expect(deployment).toBe(undefined);
    });
  });

  async function saveDeployment(overrides = {}) {
      const data = makeDeployment(overrides);
      const release = await store.saveRelease(data.release, makeRootMeta());
      return await store.saveDeployment({ ...data, release, }, makeRootMeta());
  }
});
