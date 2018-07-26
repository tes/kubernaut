import expect from 'expect';
import createSystem from '../test-system';
import { makeRegistry, makeRelease, makeRootMeta } from '../factories';

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


  function saveRegistry(registry = makeRegistry(), meta = makeRootMeta()) {
    return store.saveRegistry(registry, meta);
  }

  function saveRelease(release = makeRelease(), meta = makeRootMeta()) {
    return store.saveRelease(release, meta);
  }
});
