import expect from 'expect';
import createSystem from '../test-system';
import {
  makeRegistry,
  makeRelease,
  makeCluster,
  makeNamespace,
  makeAccount,
  makeRootMeta,
} from '../factories';

describe('Service store', () => {
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
    await store.nuke();
    await system.stop();
  });

  it('should retrieve service names similar to search value', async () => {
    const registry = await saveRegistry(makeRegistry(), makeRootMeta());
    await saveRelease(makeRelease({ service: { name: 'app-1', registry} }), makeRootMeta());
    await saveRelease(makeRelease({ service: { name: 'app-2', registry} }), makeRootMeta());
    await saveRelease(makeRelease({ service: { name: 'service-1', registry} }), makeRootMeta());

    const results = await store.searchByServiceName('app', registry);
    expect(results).toBeDefined();
    expect(results.length).toBe(2);
    expect(results[0].name).toBeDefined();
    expect(results[0].name).toBe('app-1');
    expect(results[1].name).toBeDefined();
    expect(results[1].name).toBe('app-2');
  });

  describe('findServices', () => {
    it('should find all services', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const registry2 = await saveRegistry(makeRegistry(), makeRootMeta());

      await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'app-2', registry2 } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

      const results = await store.findServices();
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 3,
      });
      expect(results.items[0].name).toBe('app-1');
      expect(results.items[1].name).toBe('app-2');
      expect(results.items[2].name).toBe('service-1');
    });

    it('should find only services for a specific registry', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const registry2 = await saveRegistry(makeRegistry(), makeRootMeta());

      await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'app-2', registry2 } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

      const results = await store.findServices({
        registries: [registry.id],
      });

      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2,
      });
      expect(results.items[0].name).toBe('app-1');
      expect(results.items[1].name).toBe('service-1');
    });

    it('should limit and offset', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const registry2 = await saveRegistry(makeRegistry(), makeRootMeta());

      await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'app-2', registry2 } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

      const results = await store.findServices({}, 1);
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 3,
      });
      expect(results.items.length).toBe(1);
      expect(results.items[0].name).toBe('app-1');

      const results2 = await store.findServices({}, 1, 1);
      expect(results2).toBeDefined();
      expect(results2).toMatchObject({
        offset: 1,
        count: 3,
      });
      expect(results2.items.length).toBe(1);
      expect(results2.items[0].name).toBe('app-2');
    });

    it('should sort services by a valid column', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());

      await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'app-2', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

      const results = await store.findServices({}, 10, 0, 'name', 'desc');
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 3,
      });
      expect(results.items[0].name).toBe('service-1');
      expect(results.items[1].name).toBe('app-2');
      expect(results.items[2].name).toBe('app-1');
    });

    it('should default sorting service with an invalid column', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());

      await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'app-2', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

      const results = await store.findServices({}, 10, 0, 'not_a_valid\'_column', 'desc');
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 3,
      });
      expect(results.items[0].name).toBe('service-1');
      expect(results.items[1].name).toBe('app-2');
      expect(results.items[2].name).toBe('app-1');
    });

    describe('filters', () => {
      it('should filter by name', async () => {
        const registry = await saveRegistry(makeRegistry(), makeRootMeta());

        await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
        await saveRelease(makeRelease({ service: { name: 'app-11', registry } }), makeRootMeta());
        await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

        const results = await store.findServices({ filters: { name: [{ value: 'app-', exact: false }] } });
        expect(results).toBeDefined();
        expect(results).toMatchObject({
          offset: 0,
          count: 2,
        });
        expect(results.items[0].name).toBe('app-1');
        expect(results.items[1].name).toBe('app-11');
      });

      it('should filter by name exactly', async () => {
        const registry = await saveRegistry(makeRegistry(), makeRootMeta());

        await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
        await saveRelease(makeRelease({ service: { name: 'app-11', registry } }), makeRootMeta());
        await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

        const results = await store.findServices({ filters: { name: [{ value: 'app-1', exact: true }] } });
        expect(results).toBeDefined();
        expect(results).toMatchObject({
          offset: 0,
          count: 1,
        });
        expect(results.items[0].name).toBe('app-1');
      });

      it('should filter by registry name', async () => {
        const registry = await saveRegistry(makeRegistry({ name: 'default1' }), makeRootMeta());
        const registry2 = await saveRegistry(makeRegistry({ name: 'not-default1' }), makeRootMeta());

        await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
        await saveRelease(makeRelease({ service: { name: 'app-11', registry } }), makeRootMeta());
        await saveRelease(makeRelease({ service: { name: 'service-1', registry: registry2 } }), makeRootMeta());

        const results = await store.findServices({ filters: { registry: [{ value: '-default1', exact: false }] } });
        expect(results).toBeDefined();
        expect(results).toMatchObject({
          offset: 0,
          count: 1,
        });
        expect(results.items[0].name).toBe('service-1');
      });

      it('should filter by registry name exactly', async () => {
        const registry = await saveRegistry(makeRegistry({ name: 'default1' }), makeRootMeta());
        const registry2 = await saveRegistry(makeRegistry({ name: 'not-default1' }), makeRootMeta());

        await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
        await saveRelease(makeRelease({ service: { name: 'app-11', registry } }), makeRootMeta());
        await saveRelease(makeRelease({ service: { name: 'service-1', registry: registry2 } }), makeRootMeta());

        const results = await store.findServices({ filters: { registry: [{ value: 'default1', exact: true }] } });
        expect(results).toBeDefined();
        expect(results).toMatchObject({
          offset: 0,
          count: 2,
        });
        expect(results.items[0].name).toBe('app-1');
        expect(results.items[1].name).toBe('app-11');
      });
    });
  });

  describe('List services allowed for deployment to a namespace', () => {
    it('List services for a namespace, indicating whether enabled or not. Sorted by name asc', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const registry2 = await saveRegistry(makeRegistry(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const release = await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'app-2', registry2 } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

      await store.enableServiceForNamespace(namespace, release.service, makeRootMeta());

      const results = await store.findServicesAndShowStatusForNamespace({
        namespace: namespace.id,
      });

      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 3,
      });
      expect(results.items[0].service.name).toBe('app-1');
      expect(results.items[0].enabled).toBe(true);
      expect(results.items[1].service.name).toBe('app-2');
      expect(results.items[1].enabled).toBe(false);
      expect(results.items[2].service.name).toBe('service-1');
      expect(results.items[2].enabled).toBe(false);
    });

    it('List services for a namespace, indicating whether enabled or not. Restricted by registry', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const registry2 = await saveRegistry(makeRegistry(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const release = await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'app-2', registry2 } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

      await store.enableServiceForNamespace(namespace, release.service, makeRootMeta());

      const results = await store.findServicesAndShowStatusForNamespace({
        namespace: namespace.id,
        registries: [registry.id],
      });

      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2,
      });
      expect(results.items[0].service.name).toBe('app-1');
      expect(results.items[0].enabled).toBe(true);
      expect(results.items[1].service.name).toBe('service-1');
      expect(results.items[1].enabled).toBe(false);
    });

    it('should limit and offset', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const registry2 = await saveRegistry(makeRegistry(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({
        cluster,
      }));

      const release = await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'app-2', registry2 } }), makeRootMeta());
      await saveRelease(makeRelease({ service: { name: 'service-1', registry } }), makeRootMeta());

      await store.enableServiceForNamespace(namespace, release.service, makeRootMeta());

      const results = await store.findServicesAndShowStatusForNamespace({
        namespace: namespace.id,
      }, 1);

      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 3,
      });
      expect(results.items.length).toBe(1);
      expect(results.items[0].service.name).toBe('app-1');
      expect(results.items[0].enabled).toBe(true);

      const results2 = await store.findServicesAndShowStatusForNamespace({
        namespace: namespace.id,
      }, 1, 1);

      expect(results2).toBeDefined();
      expect(results2).toMatchObject({
        offset: 1,
        count: 3,
      });
      expect(results2.items.length).toBe(1);
      expect(results2.items[0].service.name).toBe('app-2');
      expect(results2.items[0].enabled).toBe(false);
    });
  });

  describe('List namespaces a user can manage, and whether a not a service can deploy to them', () => {
    it('Should list namespaces with deployable status', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({ cluster }));
      const namespace2 = await saveNamespace(await makeNamespace({ cluster }));
      const release = await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());

      const account = await saveAccount();
      await grantSystemRole(account.id, 'admin');
      await grantGlobalRole(account.id, 'admin');
      await enableServiceForNamespace(namespace2, release.service);

      const results = await store.serviceDeployStatusForNamespaces(release.service.id, account);
      expect(results).toBeDefined();
      expect(results.count).toBe(1);
      expect(results.items).toBeDefined();
      const namespaceResult = results.items.find(n => n.id === namespace.id);
      expect(namespaceResult).toBeDefined();

      expect(results.deployable).toBeDefined();
      const namespace2Result = results.deployable.find(n => n.id === namespace2.id);
      expect(namespace2Result).toBeDefined();
    });

    it('should limit and offset', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const cluster = await saveCluster();
      await saveNamespace(await makeNamespace({ name: 'n1', cluster }));
      const namespace2 = await saveNamespace(await makeNamespace({ name: 'n2', cluster }));
      await saveNamespace(await makeNamespace({ name: 'n3', cluster }));
      const release = await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());

      const account = await saveAccount();
      await grantSystemRole(account.id, 'admin');
      await grantGlobalRole(account.id, 'admin');
      await enableServiceForNamespace(namespace2, release.service);

      const results = await store.serviceDeployStatusForNamespaces(release.service.id, account, 1, 1);
      expect(results).toBeDefined();
      expect(results.count).toBe(2);
      expect(results.offset).toBe(1);
      expect(results.limit).toBe(1);
      expect(results.items).toBeDefined();
      expect(results.deployable).toBeDefined();
      const namespace2Result = results.deployable.find(n => n.id === namespace2.id);
      expect(namespace2Result).toBeDefined();
    });

    it('should restrict to only namespaces a user can manage', async () => {
      const registry = await saveRegistry(makeRegistry(), makeRootMeta());
      const cluster = await saveCluster();
      const namespace = await saveNamespace(await makeNamespace({ name: 'n1', cluster }));
      const namespace2 = await saveNamespace(await makeNamespace({ name: 'n2', cluster }));
      const release = await saveRelease(makeRelease({ service: { name: 'app-1', registry } }), makeRootMeta());

      const account = await saveAccount();
      await grantSystemRole(account.id, 'admin');
      await grantRoleOnNamespace(account.id, 'developer', namespace.id);
      await grantRoleOnNamespace(account.id, 'maintainer', namespace2.id);
      await enableServiceForNamespace(namespace2, release.service);

      const results = await store.serviceDeployStatusForNamespaces(release.service.id, account);
      expect(results).toBeDefined();
      expect(results.count).toBe(0);
      expect(results.items).toBeDefined();
      expect(results.deployable).toBeDefined();
      const namespace2Result = results.deployable.find(n => n.id === namespace2.id);
      expect(namespace2Result).toBeDefined();
    });
  });

  function saveCluster(cluster = makeCluster(), meta = makeRootMeta()) {
    return store.saveCluster(cluster, meta);
  }

  function saveNamespace(namespace = makeNamespace(), meta = makeRootMeta()) {
    return store.saveNamespace(namespace, meta);
  }

  function saveRegistry(registry = makeRegistry(), meta = makeRootMeta()) {
    return store.saveRegistry(registry, meta);
  }

  function saveRelease(release = makeRelease(), meta = makeRootMeta()) {
    return store.saveRelease(release, meta);
  }

  function saveAccount(account = makeAccount(), meta = makeRootMeta() ) {
    return store.saveAccount(account, meta);
  }

  function grantRoleOnNamespace(id, name, namespace, meta = makeRootMeta() ) {
    return store.grantRoleOnNamespace(id, name, namespace, meta);
  }

  function grantGlobalRole(accountId, roleName, meta = makeRootMeta()) {
    return store.grantGlobalRole(accountId, roleName, meta);
  }

  function grantSystemRole(accountId, roleName, meta = makeRootMeta()) {
    return store.grantSystemRole(accountId, roleName, meta);
  }

  function enableServiceForNamespace(namespace, service, meta = makeRootMeta()) {
    return store.enableServiceForNamespace(namespace, service, meta);
  }

});
