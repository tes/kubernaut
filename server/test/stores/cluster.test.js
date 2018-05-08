import expect from 'expect';
import { v4 as uuid } from 'uuid';
import createSystem from '../test-system';
import { makeCluster, makeRootMeta } from '../factories';

describe('Cluster Store', () => {

  let system = { stop: cb => cb() };
  let store = { nuke: () => new Promise(cb => cb()) };

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

  describe('Save cluster', () => {

    it('should create a cluster', async () => {
      const cluster = await saveCluster();
      expect(cluster).toBeDefined();
      expect(cluster.id).toBeDefined();
    });

    it('should prevent duplicate clusters with the same name', async () => {
      const data = makeCluster({
        name: 'same-cluster',
      });

      await saveCluster(data);
      await expect(
        saveCluster(data)
      ).rejects.toHaveProperty('code', '23505');
    });

    it('should prevent duplicate clusters with the same context', async () => {
      const data = makeCluster({
        context: 'same-context',
      });

      await saveCluster(data);
      await expect(
        saveCluster(data)
      ).rejects.toHaveProperty('code', '23505');
    });

  });

  describe('Get Cluster', () => {

    it('should retrieve cluster by id', async () => {
      const data = makeCluster();
      const meta = makeRootMeta();
      const saved = await saveCluster(data, meta);
      const cluster = await getCluster(saved.id);

      expect(cluster).toBeDefined();
      expect(cluster.id).toBe(saved.id);
      expect(cluster.name).toBe(data.name);
      expect(cluster.config).toBe(data.config);
      expect(cluster.createdOn.toISOString()).toBe(meta.date.toISOString());
      expect(cluster.createdBy.id).toBe(meta.account.id);
      expect(cluster.createdBy.displayName).toBe(meta.account.displayName);
    });

    it('should return undefined when cluster not found', async () => {
      const cluster = await getCluster(uuid());
      expect(cluster).toBe(undefined);
    });
  });

  describe('Find Cluster', () => {

    it('should find a cluster by name', async () => {
      const data = makeCluster();
      const saved = await saveCluster(data);
      const cluster = await findCluster({ name: data.name });

      expect(cluster).toBeDefined();
      expect(cluster.id).toBe(saved.id);
    });

    it('should return undefined when name not found', async () => {
      const data = makeCluster();
      await saveCluster(data);

      const cluster = await findCluster({ name: 'missing' });
      expect(cluster).toBe(undefined);
    });
  });

  describe('Delete Cluster', () => {

    it('should soft delete cluster', async () => {
      const saved = await saveCluster();
      await deleteCluster(saved.id);

      const cluster = await getCluster(saved.id);
      expect(cluster).toBe(undefined);
    });
  });

  describe('Find Clusters', () => {

    it('should list clusters, ordered by name asc', async () => {

      const clusters = [
        {
          data: makeCluster({
            name: 'a',
          }),
          meta: makeRootMeta({ date: new Date('2014-07-01T10:11:12.000Z') }),
        },
        {
          data: makeCluster({
            name: 'c',
          }),
          meta: makeRootMeta({ date: new Date('2015-07-01T10:11:12.000Z') }),
        },
        {
          data: makeCluster({
            name: 'b',
          }),
          meta: makeRootMeta({ date: new Date('2013-07-01T10:11:12.000Z') }),
        },
      ];

      await Promise.all(clusters.map(cluster => {
        return saveCluster(cluster.data, cluster.meta);
      }));

      const results = await findClusters();
      expect(results.items.map(n => n.name)).toEqual(['a', 'b', 'c']);
      expect(results.count).toBe(3);
      expect(results.limit).toBe(50);
      expect(results.offset).toBe(0);
    });

    it('should exclude inactive clusters', async () => {
      const results1 = await findClusters();
      expect(results1.count).toBe(0);

      const saved = await saveCluster(makeCluster());
      const results2 = await findClusters();
      expect(results2.count).toBe(1);

      await deleteCluster(saved.id);
      const results3 = await findClusters();
      expect(results3.count).toBe(0);
    });

    describe('Pagination', () => {

      beforeEach(async () => {
        const clusters = [];
        for (var i = 0; i < 51; i++) {
          clusters.push({
            data: makeCluster({
              name: `cluster-${i}`,
            }),
          });
        }

        await Promise.all(clusters.map(async cluster => {
          return saveCluster(cluster.data);
        }));
      });

      it('should limit clusters to 50 by default', async () => {
        const results = await findClusters();
        expect(results.items.length).toBe(50);
        expect(results.count).toBe(51);
        expect(results.limit).toBe(50);
        expect(results.offset).toBe(0);
      });

      it('should limit clusters to the specified number', async () => {
        const results = await findClusters({}, 10, 0);
        expect(results.items.length).toBe(10);
        expect(results.count).toBe(51);
        expect(results.limit).toBe(10);
        expect(results.offset).toBe(0);
      });

      it('should page clusters list', async () => {
        const results = await findClusters({}, 50, 10);
        expect(results.items.length).toBe(41);
        expect(results.count).toBe(51);
        expect(results.limit).toBe(50);
        expect(results.offset).toBe(10);
      });
    });
  });

  function saveCluster(cluster = makeCluster(), meta = makeRootMeta()) {
    return store.saveCluster(cluster, meta);
  }

  function getCluster(id) {
    return store.getCluster(id);
  }

  function findCluster(criteria) {
    return store.findCluster(criteria);
  }

  function deleteCluster(id, meta = makeRootMeta()) {
    return store.deleteCluster(id, meta);
  }

  function findClusters(criteria, page, limit) {
    return store.findClusters(criteria, page, limit);
  }
});
