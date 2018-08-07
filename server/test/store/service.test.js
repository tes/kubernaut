import expect from 'expect';
import createSystem from '../test-system';
import { makeRegistry, makeRelease, makeRootMeta } from '../factories';

describe.only('Service store', () => {
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
  });


  function saveRegistry(registry = makeRegistry(), meta = makeRootMeta()) {
    return store.saveRegistry(registry, meta);
  }

  function saveRelease(release = makeRelease(), meta = makeRootMeta()) {
    return store.saveRelease(release, meta);
  }
});
