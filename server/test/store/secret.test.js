import expect from 'expect';
import createSystem from '../test-system';
import {
  makeRootMeta,
  makeNamespace,
  makeService,
  makeRelease,
  makeCluster,
} from '../factories';

describe.only('Secret store', () => {
  let system = { stop: cb => cb() };
  let store = { nuke: () => new Promise(cb => cb()) };

  before(async () => {
    system = createSystem().remove('server');
    ({ store } = await system.start());
  });

  beforeEach(async () => {
    await store.nuke();
  });

  after(async () => {
    // await store.nuke();
    await system.stop();
  });

  describe('Versions', () => {

    describe('Saving', () => {
      it('saves a version of secrets data and gets by version id', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const toInsert = {
          comment: 'abc',
          secrets: [
            {
              key: 'a',
              value: '123',
              editor: 'simple',
            },
            {
              key: 'config.json',
              value: JSON.stringify({ a: 1 }),
              editor: 'json',
            }
          ]
        };
        const id = await store.saveVersionOfSecret(service, namespace, toInsert, makeRootMeta());

        const version = await store.getVersionOfSecretById(id, makeRootMeta());
        expect(version.comment).toBe(toInsert.comment);
        expect(version.createdBy.id).toBe(makeRootMeta().account.id);
        expect(version.createdBy.displayName).toBe(makeRootMeta().account.displayName);
        expect(version.service.id).toBe(service.id);
        expect(version.service.name).toBe(service.name);
        expect(version.service.registry.id).toBe(service.registry.id);
        expect(version.service.registry.name).toBe(service.registry.name);
        expect(version.namespace.id).toBe(namespace.id);
        expect(version.namespace.name).toBe(namespace.name);
        expect(version.namespace.cluster.id).toBe(namespace.cluster.id);
        expect(version.namespace.cluster.name).toBe(namespace.cluster.name);
      });

      it('saves a version of secret with empty secrets', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const toInsert = {
          comment: 'abc',
          secrets: []
        };
        const id = await store.saveVersionOfSecret(service, namespace, toInsert, makeRootMeta());

        const version = await store.getVersionOfSecretById(id, makeRootMeta());
        expect(version).toBeDefined();
      });
    });

    describe('Retrieve secret data', () => {
      it('fetches secret data given a secret id', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const toInsert = {
          comment: 'abc',
          secrets: [
            {
              key: 'a',
              value: '123',
              editor: 'simple',
            },
            {
              key: 'config.json',
              value: JSON.stringify({ a: 1 }),
              editor: 'json',
            }
          ]
        };
        const id = await store.saveVersionOfSecret(service, namespace, toInsert, makeRootMeta());

        const versionWithData = await store.getVersionOfSecretWithDataById(id, makeRootMeta());
        expect(versionWithData).toBeDefined();
        expect(versionWithData.secrets).toMatchObject(toInsert.secrets);
      });
    });

    describe('List versions', () => {
      it('lists available versions for a service/namespace combination', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const [initMeta, updatedMeta] = [makeRootMeta(), makeRootMeta()].sort((a, b) => (a.date - b.date));
        const toInsert = [
          [{ comment: 'init', secrets: [{ key: 'config.json', value: '{}', editor: 'json' }]}, initMeta],
          [{ comment: 'updated', secrets: [{ key: 'config.json', value: '{"a":1}', editor: 'json' }]}, updatedMeta],
        ];
        for (const [version, meta] of toInsert) {
          await store.saveVersionOfSecret(service, namespace, version, meta);
        }

        const results = await store.listVersionsOfSecret(service, namespace, makeRootMeta());
        expect(results).toBeDefined();
        expect(results).toMatchObject({
          offset: 0,
          count: 2,
        });
        expect(results.items[0].comment).toBe(toInsert[1][0].comment);
        expect(results.items[1].comment).toBe(toInsert[0][0].comment);
      });

      it('should limit and offset', async () => {
        const service = await saveService();
        const cluster = await saveCluster();
        const namespace = await saveNamespace(makeNamespace({ cluster }));
        const [initMeta, updatedMeta] = [makeRootMeta(), makeRootMeta()].sort((a, b) => (a.date - b.date));
        const toInsert = [
          [{ comment: 'init', secrets: [{ key: 'config.json', value: '{}', editor: 'json' }]}, initMeta],
          [{ comment: 'updated', secrets: [{ key: 'config.json', value: '{"a":1}', editor: 'json' }]}, updatedMeta],
        ];
        for (const [version, meta] of toInsert) {
          await store.saveVersionOfSecret(service, namespace, version, meta);
        }

        const results = await store.listVersionsOfSecret(service, namespace, makeRootMeta(), 1, 1);
        expect(results).toBeDefined();
        expect(results).toMatchObject({
          offset: 1,
          count: 2,
        });
        expect(results.items.length).toBe(1);
        expect(results.items[0].comment).toBe(toInsert[0][0].comment);
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
