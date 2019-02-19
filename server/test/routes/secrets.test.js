import expect from 'expect';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import {
  makeRelease,
  makeRootMeta,
  makeCluster,
  makeNamespace,
  makeService,
  makeRequestWithDefaults,
} from '../factories';

describe('Secrets API', () => {
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

  describe('GET /api/secrets', () => {

    beforeEach(async () => {
      await store.nuke();
    });

    describe('GET /api/secrets/:registry/:service/:namespace', () => {
      it('retrieves an empty list of versions', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));

        const response = await request({
          url: `/api/secrets/${service.registry.name}/${service.name}/${namespace.id}`,
          method: 'GET',
        });

        expect(response).toBeDefined();
        expect(response).toMatchObject({
          count: 0,
          offset: 0,
          limit: 20,
          items: [],
        });
      });

      it('retrieves versions of a secret', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const [initMeta, updatedMeta] = [makeRootMeta(), makeRootMeta()].sort((a, b) => (a.date - b.date));
        const versionData = [
          [{ comment: 'init', secrets: [{ key: 'config.json', value: '{}', editor: 'json' }]}, initMeta],
          [{ comment: 'updated', secrets: [{ key: 'config.json', value: '{"a":1}', editor: 'json' }]}, updatedMeta],
        ];
        for (const [version, meta] of versionData) {
          await store.saveVersionOfSecret(service, namespace, version, meta);
        }

        const response = await request({
          url: `/api/secrets/${service.registry.name}/${service.name}/${namespace.id}`,
          method: 'GET',
        });

        expect(response).toBeDefined();
        expect(response).toMatchObject({
          count: 2,
          offset: 0,
          limit: 20,
          items: [
            {
              comment: versionData[1][0].comment,
              namespace: {
                id: namespace.id,
                name: namespace.name,
                cluster: {
                  name: cluster.name,
                },
              },
              service: {
                id: service.id,
                name: service.name,
              },
            },
            {
              comment: versionData[0][0].comment,
              namespace: {
                id: namespace.id,
                name: namespace.name,
                cluster: {
                  name: cluster.name,
                },
              },
              service: {
                id: service.id,
                name: service.name,
              },
            }
          ],
        });
      });

      it('limits and offsets', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const [initMeta, updatedMeta] = [makeRootMeta(), makeRootMeta()].sort((a, b) => (a.date - b.date));
        const versionData = [
          [{ comment: 'init', secrets: [{ key: 'config.json', value: '{}', editor: 'json' }]}, initMeta],
          [{ comment: 'updated', secrets: [{ key: 'config.json', value: '{"a":1}', editor: 'json' }]}, updatedMeta],
        ];
        for (const [version, meta] of versionData) {
          await store.saveVersionOfSecret(service, namespace, version, meta);
        }

        const response = await request({
          url: `/api/secrets/${service.registry.name}/${service.name}/${namespace.id}`,
          qs: { limit: 1, offset: 1 },
          method: 'GET',
        });

        expect(response).toBeDefined();
        expect(response).toMatchObject({
          count: 2,
          offset: 1,
          limit: 1,
          items: [
            {
              comment: versionData[0][0].comment,
              namespace: {
                id: namespace.id,
                name: namespace.name,
                cluster: {
                  name: cluster.name,
                },
              },
              service: {
                id: service.id,
                name: service.name,
              },
            }
          ],
        });
      });

      it('responds with 404 for a missing service');
      it('responds with 404 for a missing namespace');

    });

    describe('POST /api/secrets/:registry/:service/:namespace', () => {
      it('saves a version of a secret', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));

        const data = {
          comment: 'init',
          secrets: [{ key: 'config.json', value: '{}', editor: 'json' }]
        };

        const response = await request({
          url: `/api/secrets/${service.registry.name}/${service.name}/${namespace.id}`,
          method: 'POST',
          json: data,
        });

        expect(response).toBeDefined();
        const stored = await store.getVersionOfSecretWithDataById(response, makeRootMeta());
        expect(stored).toBeDefined();
        expect(stored.comment).toBe(data.comment);
        expect(stored.secrets).toMatchObject(data.secrets);
        expect(stored.service.id).toBe(service.id);
        expect(stored.namespace.id).toBe(namespace.id);
      });
    });

    describe('GET /api/secrets/:id', () => {
      it('retrieves a version of a secret', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const id = await store.saveVersionOfSecret(service, namespace, {
          comment: 'init',
          secrets: [{ key: 'config.json', value: '{}', editor: 'json' }]
        }, makeRootMeta());


        const response = await request({
          url: `/api/secrets/${id}`,
          method: 'GET',
        });

        expect(response).toBeDefined();
        expect(response.comment).toBe('init');
        expect(response.service.id).toBe(service.id);
        expect(response.namespace.id).toBe(namespace.id);
      });

      it('returns 404 for a missing version');
    });


    describe('GET /api/secrets/:id/with-data', () => {
      it('retrieves a version of a secret with data', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const newVersion = {
          comment: 'init',
          secrets: [{ key: 'config.json', value: '{}', editor: 'json' }]
        };
        const id = await store.saveVersionOfSecret(service, namespace, newVersion, makeRootMeta());


        const response = await request({
          url: `/api/secrets/${id}/with-data`,
          method: 'GET',
        });

        expect(response).toBeDefined();
        expect(response.comment).toBe('init');
        expect(response.service.id).toBe(service.id);
        expect(response.namespace.id).toBe(namespace.id);
        expect(response.secrets).toBeDefined();
        expect(response.secrets).toMatchObject(newVersion.secrets);
      });

      it('returns 404 for a missing version');
    });

  });

  function saveNamespace(namespace = makeNamespace(), meta = makeRootMeta()) {
    return store.saveNamespace(namespace, meta);
  }

  function saveCluster(cluster = makeCluster(), meta = makeRootMeta()) {
    return store.saveCluster(cluster, meta);
  }

  async function saveService(service = makeService(), meta = makeRootMeta()) {
    const release = await store.saveRelease(makeRelease({ service }), meta);
    return release.service;
  }
});
