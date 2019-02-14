import expect from 'expect';
import errors from 'request-promise/errors';
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

describe.only('Secrets API', () => {
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
