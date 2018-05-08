import expect from 'expect';
import { v4 as uuid, } from 'uuid';
import createSystem from '../test-system';
import { makeRegistry, makeRootMeta, } from '../factories';

describe('Registry Store', () => {

  let system = { stop: cb => cb(), };
  let store = { nuke: () => new Promise(cb => cb()), };

  before(async () => {
    system = createSystem().remove('server');

    const components = await system.start();
    store = components.store;
  });

  beforeEach(async () => {
    await store.nuke();
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });

  describe('Save registry', () => {

    it('should create a registry', async () => {
      const registry = await saveRegistry();
      expect(registry).toBeDefined();
      expect(registry.id).toBeDefined();
    });

    it('should prevent duplicate registries', async () => {
      const data = makeRegistry({
        name: 'same-registry',
      });

      await saveRegistry(data);
      await expect(
        saveRegistry(data)
      ).rejects.toHaveProperty('code', '23505');
    });
  });

  describe('Get Registry', () => {

    it('should retrieve registry by id', async () => {
      const data = makeRegistry();
      const meta = makeRootMeta();
      const saved = await saveRegistry(data, meta);
      const registry = await getRegistry(saved.id);

      expect(registry).toBeDefined();
      expect(registry.id).toBe(saved.id);
      expect(registry.name).toBe(data.name);
      expect(registry.createdOn.toISOString()).toBe(meta.date.toISOString());
      expect(registry.createdBy.id).toBe(meta.account.id);
      expect(registry.createdBy.displayName).toBe(meta.account.displayName);
    });

    it('should return undefined when registry not found', async () => {
      const registry = await getRegistry(uuid());
      expect(registry).toBe(undefined);
    });
  });

  describe('Find Registry', () => {

    it('should find a registry by name', async () => {
      const data = makeRegistry();
      const saved = await saveRegistry(data);
      const registry = await findRegistry({ name: data.name, });

      expect(registry).toBeDefined();
      expect(registry.id).toBe(saved.id);
    });

    it('should return undefined when name not found', async () => {
      const data = makeRegistry();
      await saveRegistry(data);

      const registry = await findRegistry({ name: 'missing', });
      expect(registry).toBe(undefined);
    });
  });

  describe('Find Registries', () => {

    it('should list registries, ordered by name asc', async () => {

      const registries = [
        {
          data: makeRegistry({
            name: 'a',
          }),
          meta: makeRootMeta({ date: new Date('2014-07-01T10:11:12.000Z'), }),
        },
        {
          data: makeRegistry({
            name: 'c',
          }),
          meta: makeRootMeta({ date: new Date('2015-07-01T10:11:12.000Z'), }),
        },
        {
          data: makeRegistry({
            name: 'b',
          }),
          meta: makeRootMeta({ date: new Date('2013-07-01T10:11:12.000Z'), }),
        },
      ];

      await Promise.all(registries.map(registry => {
        return saveRegistry(registry.data, registry.meta);
      }));

      const results = await findRegistries();
      expect(results.items.map(n => n.name)).toEqual(['a', 'b', 'c', 'default',]);
      expect(results.count).toBe(4);
      expect(results.limit).toBe(50);
      expect(results.offset).toBe(0);
    });

    it('should exclude inactive registries', async () => {
      const results1 = await findRegistries();
      expect(results1.count).toBe(1);

      const saved = await saveRegistry(makeRegistry());
      const results2 = await findRegistries();
      expect(results2.count).toBe(2);

      await deleteRegistry(saved.id);
      const results3 = await findRegistries();
      expect(results3.count).toBe(1);
    });

    it('should filter by registry ids', async () => {
      const registry1 = makeRegistry({ name: 'r1', });
      const registry2 = makeRegistry({ name: 'r2', });

      const saved1 = await saveRegistry(registry1);
      const saved2 = await saveRegistry(registry2);

      const results1 = await findRegistries({ ids: [ saved1.id, ], });
      expect(results1.count).toBe(1);
      expect(results1.items[0].id).toBe(saved1.id);

      const results2 = await findRegistries({ ids: [ saved2.id, ], });
      expect(results2.count).toBe(1);
      expect(results2.items[0].id).toBe(saved2.id);

      const results3 = await findRegistries({ ids: [ saved1.id, saved2.id, ], });
      expect(results3.count).toBe(2);
      expect(results3.items[0].id).toBe(saved1.id);
      expect(results3.items[1].id).toBe(saved2.id);
    });

    it('should filter registry by criteria', async () => {
      const registry1 = makeRegistry({ name: 'r1', });
      const registry2 = makeRegistry({ name: 'r2', });

      const saved1 = await saveRegistry(registry1);
      const saved2 = await saveRegistry(registry2);

      const results1 = await findRegistries({ name: registry1.name, });
      expect(results1.count).toBe(1);
      expect(results1.items[0].id).toBe(saved1.id);

      const results2 = await findRegistries({ name: registry2.name, });
      expect(results2.count).toBe(1);
      expect(results2.items[0].id).toBe(saved2.id);
    });

    describe('Pagination', () => {

      beforeEach(async () => {
        const registries = [];
        for (var i = 0; i < 51; i++) {
          registries.push({
            data: makeRegistry({
              // Must be alphebetically greater than 'default'
              name: `x-registry-${i}`,
            }),
          });
        }

        await Promise.all(registries.map(async registry => {
          return saveRegistry(registry.data);
        }));
      });

      it('should limit registries to 50 by default', async () => {
        const results = await findRegistries();
        expect(results.items.length).toBe(50);
        expect(results.count).toBe(52);
        expect(results.limit).toBe(50);
        expect(results.offset).toBe(0);
      });

      it('should limit registries to the specified number', async () => {
        const results = await findRegistries({}, 10, 0);
        expect(results.items.length).toBe(10);
        expect(results.count).toBe(52);
        expect(results.limit).toBe(10);
        expect(results.offset).toBe(0);
      });

      it('should page registries list', async () => {
        const results = await findRegistries({}, 50, 10);
        expect(results.items.length).toBe(42);
        expect(results.count).toBe(52);
        expect(results.limit).toBe(50);
        expect(results.offset).toBe(10);
      });
    });
  });

  describe('Delete Registry', () => {

    it('should soft delete registry', async () => {
      const saved = await saveRegistry();
      await deleteRegistry(saved.id);

      const registry = await getRegistry(saved.id);
      expect(registry).toBe(undefined);
    });
  });

  function saveRegistry(registry = makeRegistry(), meta = makeRootMeta()) {
    return store.saveRegistry(registry, meta);
  }

  function getRegistry(id) {
    return store.getRegistry(id);
  }

  function findRegistry(criteria) {
    return store.findRegistry(criteria);
  }

  function findRegistries(criteria, page, limit) {
    return store.findRegistries(criteria, page, limit);
  }

  function deleteRegistry(id, meta = makeRootMeta()) {
    return store.deleteRegistry(id, meta);
  }
});
