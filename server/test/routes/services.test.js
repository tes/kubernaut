import expect from 'expect';
import request from 'request-promise';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeRelease, makeRootMeta, makeCluster, makeNamespace } from '../factories';

describe('Services API', () => {

  let config;
  let system = { stop: cb => cb() };
  let store = { nuke: new Promise(cb => cb()) };

  const loggerOptions = {};

  before(async () => {
    system = createSystem()
      .set('transports.human', human(loggerOptions)).dependsOn('config');

    ({ config, store } = await system.start());
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
        url: `http://${config.server.host}:${config.server.port}/api/services`,
        method: 'GET',
        json: true,
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(50);
      expect(services.items.length).toBe(50);
    });

    it('should limit services list', async () => {

      const services = await request({
        url: `http://${config.server.host}:${config.server.port}/api/services`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
        json: true,
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(40);
      expect(services.items.length).toBe(40);
    });

    it('should page results', async () => {

      const services = await request({
        url: `http://${config.server.host}:${config.server.port}/api/services`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
        json: true,
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(10);
      expect(services.limit).toBe(50);
      expect(services.items.length).toBe(41);
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
        url: `http://${config.server.host}:${config.server.port}/api/service/${release.service.id}/enable-deployment/${namespace.id}`,
        method: 'POST',
        json: true,
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
        url: `http://${config.server.host}:${config.server.port}/api/service/${release2.service.id}/enable-deployment/${namespace.id}`,
        qs: { limit: 1, offset: 1 },
        method: 'POST',
        json: true,
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
        url: `http://${config.server.host}:${config.server.port}/api/service/${release.service.id}/disable-deployment/${namespace.id}`,
        method: 'DELETE',
        json: true,
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
        url: `http://${config.server.host}:${config.server.port}/api/service/${release2.service.id}/disable-deployment/${namespace.id}`,
        qs: { limit: 1, offset: 1 },
        method: 'DELETE',
        json: true,
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
        url: `http://${config.server.host}:${config.server.port}/api/services-with-status-for-namespace/${namespace.id}`,
        method: 'GET',
        json: true,
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
        url: `http://${config.server.host}:${config.server.port}/api/services-with-status-for-namespace/${namespace.id}`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
        json: true,
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
        url: `http://${config.server.host}:${config.server.port}/api/services-with-status-for-namespace/${namespace.id}`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
        json: true,
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
