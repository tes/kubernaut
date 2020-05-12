import expect from 'expect';
import createSystem from '../test-system';
import {
  makeRootMeta,
  makeRegistry,
  makeNamespace,
  makeCluster,
} from '../factories';

describe('Job store', () => {
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

  describe('Saving', () => {
    it('saves a job and gets it by id', async () => {
      const namespace = await saveNamespace();
      const registry = await saveRegistry();
      const toSave = 'bob';

      const id = await store.saveJob(toSave, registry, namespace, makeRootMeta());
      const job = await store.getJob(id);
      expect(job.name).toBe(toSave);
      expect(job.registry.id).toBe(registry.id);
      expect(job.namespace.id).toBe(namespace.id);
    });

    it('saves a job version and gets it by id', async () => {
      const namespace = await saveNamespace();
      const registry = await saveRegistry();
      const job = await store.getJob(await store.saveJob('bob', registry, namespace, makeRootMeta()));
      const versionDataToSave = {
        yaml: 'some yaml',
      };
      const newVersionId = await store.saveJobVersion(job, versionDataToSave, makeRootMeta());
      const version = await store.getJobVersion(newVersionId);

      expect(version.job.id).toBe(job.id);
      expect(version).toMatchObject(versionDataToSave);
    });
  });

  describe('findJobs', () => {
    it('should find all jobs', async () => {
      const namespace = await saveNamespace();
      const registry = await saveRegistry();

      await store.saveJob('job1', registry, namespace, makeRootMeta());
      await store.saveJob('job2', registry, namespace, makeRootMeta());

      const results = await store.findJobs();
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2,
      });
      expect(results.items[0].name).toBe('job1');
      expect(results.items[1].name).toBe('job2');
    });

    it('should find jobs for a specific namespace', async () => {
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();
      const registry = await saveRegistry();

      await store.saveJob('job1', registry, namespace, makeRootMeta());
      await store.saveJob('job2', registry, namespace2, makeRootMeta());

      const results = await store.findJobs({
        filters: {
          namespace: [ { value: namespace.name, exact: true } ]
        }
      });
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 1,
      });
      expect(results.items[0].name).toBe('job1');
    });
  });

  describe('findJobVersions', () => {
    it('should find versions for a job', async () => {
      const namespace = await saveNamespace();
      const registry = await saveRegistry();
      const job = await store.getJob(await store.saveJob('job1', registry, namespace, makeRootMeta()));
      const job2 = await store.getJob(await store.saveJob('job2', registry, namespace, makeRootMeta()));
      const versionDataToSave = { yaml: 'some yaml' };

      await store.saveJobVersion(job, versionDataToSave, makeRootMeta());
      await store.saveJobVersion(job, versionDataToSave, makeRootMeta());
      await store.saveJobVersion(job2, versionDataToSave, makeRootMeta());

      const results = await store.findJobVersions(job);
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2,
      });
    });

    it('should indicate the last applied version of a job version', async () => {
      const namespace = await saveNamespace();
      const registry = await saveRegistry();
      const job = await store.getJob(await store.saveJob('job1', registry, namespace, makeRootMeta()));
      const versionDataToSave = { yaml: 'some yaml' };

      const v1 = await store.saveJobVersion(job, versionDataToSave, makeRootMeta());
      const v2 = await store.saveJobVersion(job, versionDataToSave, makeRootMeta());

      const applyMeta = makeRootMeta();
      const laterApplyMeta = {
        ...applyMeta,
        date: new Date(applyMeta.date.getTime() + 10000),
      };

      await store.setJobVersionLastApplied({ id: v1 }, applyMeta);
      await store.setJobVersionLastApplied({ id: v2 }, laterApplyMeta);

      const results = await store.findJobVersions(job);
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2,
      });
      expect(results.items.find(({ id }) => id === v2).isLatestApplied).toBe(true);
    });
  });

  describe('job version secrets', () => {
    it('saves secrets for a version of a job', async () => {
      const namespace = await saveNamespace();
      const registry = await saveRegistry();
      const job = await store.getJob(await store.saveJob('job1', registry, namespace, makeRootMeta()));
      const versionDataToSave = { yaml: 'some yaml' };

      const versionId = await store.saveJobVersion(job, versionDataToSave, makeRootMeta());

      const toInsert = {
        secrets: [
          {
            key: 'a',
            value: 'b',
            editor: 'simple'
          },
          {
            key: 'c',
            value: 'd',
            editor: 'json',
          },
        ],
      };
      await store.saveJobVersionOfSecret(versionId, toInsert, makeRootMeta());

      const retrieved = await store.getJobVersionSecretWithData(versionId, makeRootMeta());
      expect(retrieved).toBeDefined();
      expect(retrieved.length).toBe(2);
      expect(retrieved).toMatchObject(toInsert.secrets);
    });
  });

  function saveRegistry(registry = makeRegistry(), meta = makeRootMeta() ) {
    return store.saveRegistry(registry, meta);
  }

  function saveNamespace() {
    return store.saveCluster(makeCluster(), makeRootMeta())
      .then(cluster => {
        const namespace = makeNamespace({ cluster });
        return store.saveNamespace(namespace, makeRootMeta());
      });
  }
});
