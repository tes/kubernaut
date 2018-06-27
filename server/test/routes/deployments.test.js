import expect from 'expect';
import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeRelease, makeCluster, makeNamespace, makeDeployment, makeRootMeta } from '../factories';

describe('Deployments API', () => {

  let config;
  let system = { stop: new Promise(cb => cb()) };
  let store = { nuke: new Promise(cb => cb()) };
  let kubernetes = { nuke: new Promise(cb => cb()) };

  const loggerOptions = {};

  before(async () => {
    system = createSystem()
      .set('transports.human', human(loggerOptions)).dependsOn('config');

    ({ config, store, kubernetes } = await system.start());
  });

  beforeEach(async () => {
    await store.nuke();
    await kubernetes.nuke();
  });

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });

  describe('GET /api/deployments', () => {

    beforeEach(async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());
      const deployments = [];

      for (var i = 0; i < 51; i++) {
        deployments.push({
          data: makeDeployment({ namespace }),
          meta: makeRootMeta(),
        });
      }

      await Promise.all(deployments.map(async record => {
        const release = await store.saveRelease(record.data.release, makeRootMeta());
        const deployment = { ...record.data, release };
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
        qs: { limit: 40, offset: 0 },
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
        qs: { limit: 50, offset: 10 },
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
      const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());
      const saved = await saveDeployment({ namespace });

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

  describe('GET /api/deployments/latest-by-namespace/:registry/:service', () => {
    let registry;
    let latestFromNs1;
    let latestFromNs2;

    beforeEach(async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const cluster2 = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace1 = await store.saveNamespace(makeNamespace({ name: 'ns1', cluster, context: 'test' }), makeRootMeta());
      const namespace2 = await store.saveNamespace(makeNamespace({ name: 'ns2', cluster: cluster2, context: 'test' }), makeRootMeta());
      const release1 = await store.saveRelease(makeRelease({ service: { name: 'hello-world' }, version: 1 }), makeRootMeta());
      const release2 = await store.saveRelease(makeRelease({ service: { name: 'hello-world' }, version: 2 }), makeRootMeta());
      registry = release1.service.registry.name;

      const depsForNs1 = [
        makeDeployment({
          release: release1,
          namespace: namespace1,
        }),
        makeDeployment({
          release: release2,
          namespace: namespace1,
        }),
      ];

      const depsForNs2 = [
        makeDeployment({
          release: release1,
          namespace: namespace2,
        }),
        makeDeployment({
          release: release2,
          namespace: namespace2,
        }),
      ];

      const savedNs1 = [];
      for (const dep of depsForNs1) {
        const saved = await store.saveDeployment(dep, makeRootMeta());
        savedNs1.push(saved);
      }

      const savedNs2 = [];
      for (const dep of depsForNs2) {
        const saved = await store.saveDeployment(dep, makeRootMeta());
        savedNs2.push(saved);
      }

      latestFromNs1 = savedNs1.sort((({ createdOn: a }, { createdOn: b }) => (b - a)))[0].release.id;
      latestFromNs2 = savedNs2.sort((({ createdOn: a }, { createdOn: b }) => (b - a)))[0].release.id;
    });

    it('should return the most recent deployments for each namespace', async () => {
      const deployments = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/latest-by-namespace/${registry}/hello-world`,
        method: 'GET',
        json: true,
      });

      expect(deployments.length).toBe(2);
      expect(deployments.filter(({ namespace: { name } }) => (name === 'ns1')).length).toBe(1);
      expect(deployments.filter(({ namespace: { name } }) => (name === 'ns2')).length).toBe(1);
      expect(deployments.find(({ namespace: { name } }) => (name === 'ns1')).release.id).toBe(latestFromNs1);
      expect(deployments.find(({ namespace: { name } }) => (name === 'ns2')).release.id).toBe(latestFromNs2);
    });

    it('should return empty for no deployments', async () => {

      loggerOptions.suppress = true;

      const deployments = await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments/latest-by-namespace/${registry}/hello-world2`,
        method: 'GET',
        json: true,
      });

      expect(deployments.length).toBe(0);
    });
  });

  describe('POST /api/deployments', () => {

    it('should save a deployment', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test' }), makeRootMeta());

      const release = makeRelease({
        service: {
          name: 'release-1',
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
      expect(response.status).toBe('pending');
      expect(response.log.length).toBe(1);

      const deployment = await store.getDeployment(response.id);
      expect(deployment).toBeDefined();
      expect(deployment.namespace.id).toBe(namespace.id);
      expect(deployment.namespace.cluster.id).toBe(cluster.id);
      expect(deployment.manifest.yaml).toMatch(/image: "registry\/repo\/release-1:22"/);
      expect(deployment.manifest.json[2].spec.replicas).toBe(3);
      expect(deployment.manifest.json[2].spec.template.spec.containers[0].image).toBe('registry/repo/release-1:22');
      expect(deployment.release.service.name).toBe(release.service.name);
      expect(deployment.release.version).toBe(release.version);
      expect(deployment.applyExitCode).toBe(0);
      expect(deployment.rolloutStatusExitCode).toBe(null);
      expect(deployment.log.length).toBe(1);
      expect(deployment.attributes.replicas).toBe("3");
    });

    it('should report manifest compilation errors', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test' }), makeRootMeta());

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
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test' }), makeRootMeta());

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
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test' }), makeRootMeta());

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
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test' }), makeRootMeta());
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
      const lines = response.split('\n');
      const finalOutput = JSON.parse(lines.slice(-1));

      expect(finalOutput.id).toBeDefined();
      expect(finalOutput.status).toBe('success');
      expect(finalOutput.log.length).toBe(3);

      const deployment = await store.getDeployment(finalOutput.id);
      expect(deployment.applyExitCode).toBe(0);
      expect(deployment.rolloutStatusExitCode).toBe(0);
      expect(deployment.log.length).toBe(3);
    });

    it('should report rollout failure', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test' }), makeRootMeta());
      const release = makeRelease({
        service: {
          name: 'x-release-1',
        },
      });

      await store.saveRelease(release, makeRootMeta());

      loggerOptions.suppress = true;

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

      const lines = response.split('\n');
      const finalOutput = JSON.parse(lines.slice(-1));
      expect(finalOutput.id).toBeDefined();
      expect(finalOutput.status).toBe('failure');
      expect(finalOutput.log.length).toBe(3);

      const deployment = await store.getDeployment(finalOutput.id);
      expect(deployment.applyExitCode).toBe(0);
      expect(deployment.rolloutStatusExitCode).toBe(99);
      expect(deployment.log.length).toBe(3);
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

      const release = makeRelease({
        service: {
          name: 'baz',
        },
        version: '22',
      });

      await store.saveRelease(release, makeRootMeta());

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/deployments`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          cluster: 'foo',
          registry: release.service.registry.name,
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
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'missing' }), makeRootMeta());
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

      const cluster = await store.saveCluster(makeCluster({ name: 'Test' }), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'missing', cluster, context: 'test' }), makeRootMeta());
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

      const cluster = await store.saveCluster(makeCluster({ name: 'Test' }), makeRootMeta());
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
      const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());
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

      const cluster = await store.saveCluster(makeCluster({ name: 'Test' }), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ name: 'default', cluster, context: 'test' }), makeRootMeta());
      const saved = await saveDeployment({ namespace });

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
      return await store.saveDeployment({ ...data, release }, makeRootMeta());
  }
});
