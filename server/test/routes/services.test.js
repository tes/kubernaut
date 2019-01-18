import expect from 'expect';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import {
  makeRelease,
  makeRootMeta,
  makeCluster,
  makeNamespace,
  makeRequestWithDefaults,
} from '../factories';

describe('Services API', () => {
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

  describe('GET /api/services', () => {

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

    it('should return a list of services', async () => {
      const services = await request({
        url: `/api/services`,
        method: 'GET',
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(50);
      expect(services.items.length).toBe(50);
    });

    it('should limit services list', async () => {

      const services = await request({
        url: `/api/services`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(40);
      expect(services.items.length).toBe(40);
    });

    it('should page results', async () => {

      const services = await request({
        url: `/api/services`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(10);
      expect(services.limit).toBe(50);
      expect(services.items.length).toBe(41);
    });

    it('should sort results', async () => {
      const services = await request({
        url: `/api/services`,
        qs: { sort: 'name', order: 'desc' },
        method: 'GET',
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(50);
      expect(services.items.length).toBe(50);
      const first = services.items[0];
      const last = services.items[49];
      expect(first.name > last.name).toBe(true);
    });

  });

  describe('GET /api/services/:registry/:service', () => {
    it('retrieves a service', async () => {
      const release = await store.saveRelease(makeRelease(), makeRootMeta());
      const response = await request({
        url: `/api/services/${release.service.registry.name}/${release.service.name}`,
        method: 'GET',
      });

      expect(response.id).toBe(release.service.id);
    });

    it('returns a 404 if the service does not exist', async () => {
      loggerOptions.suppress = true;
      await request({
        url: `/api/services/abc/123`,
        method: 'GET',
        resolveWithFullResponse: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
      });
    });
  });

  describe('GET /api/services/:registry/:service/namespace-status', () => {
    it('returns a list of namespaces and the status for which the service has to deploy or not', async () => {
      const release = await store.saveRelease(makeRelease(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));
      const namespace2 = await saveNamespace(await makeNamespace({
        cluster,
      }));
      await store.enableServiceForNamespace(namespace2, release.service, makeRootMeta());

      const response = await request({
        url: `/api/services/${release.service.registry.name}/${release.service.name}/namespace-status`,
        method: 'GET',
      });

      expect(response).toBeDefined();
      expect(response.count).toBe(2);
      expect(response.items).toBeDefined();
      const namespaceResult = response.items.find(status => status.namespace.id === namespace.id);
      expect(namespaceResult).toBeDefined();
      const namespace2Result = response.items.find(status => status.namespace.id === namespace2.id);
      expect(namespace2Result).toBeDefined();
      expect(namespaceResult.canDeploy).toBe(false);
      expect(namespace2Result.canDeploy).toBe(true);
    });
  });

  describe('POST /api/service/:serviceId/enable-deployment/:namespaceId', () => {
    beforeEach(async () => {
      await store.nuke();
    });

    it('enables a service for a namespace', async () => {
      const release = await store.saveRelease(makeRelease(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const response = await request({
        url: `/api/service/${release.service.id}/enable-deployment/${namespace.id}`,
        method: 'POST',
      });

      expect(response.count).toBe(1);
      expect(response.offset).toBe(0);
      expect(response.limit).toBe(20);
      expect(response.items.length).toBe(1);
      expect(response.items[0]).toMatchObject({
        enabled: true,
        service: {
          id: release.service.id,
        },
      });
    });

    it('works with pagination', async () => {
      await store.saveRelease(makeRelease({ service: { name: 'app-1' } }), makeRootMeta());
      const release2 = await store.saveRelease(makeRelease({ service: { name: 'app-2' } }), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const response = await request({
        url: `/api/service/${release2.service.id}/enable-deployment/${namespace.id}`,
        qs: { limit: 1, offset: 1 },
        method: 'POST',
      });

      expect(response.count).toBe(2);
      expect(response.offset).toBe(1);
      expect(response.limit).toBe(1);
      expect(response.items.length).toBe(1);
      expect(response.items[0]).toMatchObject({
        enabled: true,
        service: {
          id: release2.service.id,
        },
      });
    });

    it('returns namespaces for a service if asked', async () => {
      const release = await store.saveRelease(makeRelease(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const response = await request({
        url: `/api/service/${release.service.id}/enable-deployment/${namespace.id}?fetchNamespaces=true`,
        method: 'POST',
      });

      expect(response.count).toBe(1);
      expect(response.offset).toBe(0);
      expect(response.limit).toBe(20);
      expect(response.items.length).toBe(1);
      expect(response.items[0]).toMatchObject({
        canDeploy: true,
        namespace: {
          id: namespace.id,
        },
      });
    });
  });

  describe('DELETE /api/service/:serviceId/disable-deployment/:namespaceId', () => {
    beforeEach(async () => {
      await store.nuke();
    });

    it('enables a service for a namespace', async () => {
      const release = await store.saveRelease(makeRelease(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      await store.enableServiceForNamespace(namespace, release.service, makeRootMeta());

      const response = await request({
        url: `/api/service/${release.service.id}/disable-deployment/${namespace.id}`,
        method: 'DELETE',
      });

      expect(response.count).toBe(1);
      expect(response.offset).toBe(0);
      expect(response.limit).toBe(20);
      expect(response.items.length).toBe(1);
      expect(response.items[0]).toMatchObject({
        enabled: false,
        service: {
          id: release.service.id,
        },
      });
    });

    it('works with pagination', async () => {
      await store.saveRelease(makeRelease({ service: { name: 'app-1' } }), makeRootMeta());
      const release2 = await store.saveRelease(makeRelease({ service: { name: 'app-2' } }), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      await store.enableServiceForNamespace(namespace, release2.service, makeRootMeta());

      const response = await request({
        url: `/api/service/${release2.service.id}/disable-deployment/${namespace.id}`,
        qs: { limit: 1, offset: 1 },
        method: 'DELETE',
      });

      expect(response.count).toBe(2);
      expect(response.offset).toBe(1);
      expect(response.limit).toBe(1);
      expect(response.items.length).toBe(1);
      expect(response.items[0]).toMatchObject({
        enabled: false,
        service: {
          id: release2.service.id,
        },
      });
    });

    it('returns namespaces for a service if asked', async () => {
      const release = await store.saveRelease(makeRelease(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const response = await request({
        url: `/api/service/${release.service.id}/disable-deployment/${namespace.id}?fetchNamespaces=true`,
        method: 'DELETE',
      });

      expect(response.count).toBe(1);
      expect(response.offset).toBe(0);
      expect(response.limit).toBe(20);
      expect(response.items.length).toBe(1);
      expect(response.items[0]).toMatchObject({
        canDeploy: false,
        namespace: {
          id: namespace.id,
        },
      });
    });
  });

  describe('GET /api/services-with-status-for-namespace/:namespaceId', () => {

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

    it('should return a list of services and their status for a namespace', async () => {
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const services = await request({
        url: `/api/services-with-status-for-namespace/${namespace.id}`,
        method: 'GET',
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(20);
      expect(services.items.length).toBe(20);
    });

    it('should limit services list', async () => {
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const services = await request({
        url: `/api/services-with-status-for-namespace/${namespace.id}`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(40);
      expect(services.items.length).toBe(40);
    });

    it('should page results', async () => {
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const services = await request({
        url: `/api/services-with-status-for-namespace/${namespace.id}`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(10);
      expect(services.limit).toBe(50);
      expect(services.items.length).toBe(41);
    });

  });
  function saveCluster(cluster = makeCluster(), meta = makeRootMeta()) {
    return store.saveCluster(cluster, meta);
  }

  function saveNamespace(namespace = makeNamespace(), meta = makeRootMeta()) {
    return store.saveNamespace(namespace, meta);
  }
});
