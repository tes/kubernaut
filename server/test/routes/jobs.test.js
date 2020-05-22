import expect from 'expect';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import {
  makeRootMeta,
  makeCluster,
  makeNamespace,
  makeRegistry,
  makeRequestWithDefaults,
  makeJob,
} from '../factories';

const sampleYaml = ({ jobId }) => `
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: a-cronjob-af7b41de
spec:
  schedule: 0 * * * *
  concurrencyPolicy: Replace
  jobTemplate:
    spec:
      template:
        metadata:
          labels:
            some/label/bool: 'true'
            cronjobName: a-cronjob-af7b41de
            cronjobUuid: ${jobId}
        spec:
          initContainers:
            - name: init
              image: busybox
              command:
                - some
                - command
              volumeMounts:
                - mountPath: /cache
                  name: empty
                - mountPath: /secret
                  name: job-secret
          containers:
            - name: main
              image: busybox
              command:
                - some
                - other
                - command
              volumeMounts:
                - mountPath: /cache
                  name: empty
              envFrom:
                - secretRef:
                    name: cronjob-a-cronjob-af7b41de
          volumes:
            - name: job-secret
              secret:
                secretName: cronjob-a-cronjob-af7b41de
            - name: empty
              emptyDir: {}
          restartPolicy: OnFailure
`;

describe('Jobs API', () => {
  let request;
  let config;
  let system = { stop: cb => cb() };
  let store = { nuke: () => new Promise(cb => cb()) };
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

  after(async () => {
    await store.nuke();
    await system.stop();
  });
  afterEach(() => {
    loggerOptions.suppress = false;
  });

  describe('GET /api/jobs', () => {
    beforeEach(async () => {
      await store.nuke();
      const registry = await saveRegistry();
      const namespace = await saveNamespace();

      let i = 0;
      while (i < 51) {
        try {
          // random names aren't so random ... keep trying till they don't collide
          await store.saveJob(makeJob().name, registry, namespace, makeRootMeta());
          i++;
        } catch (e) {
          if (e.code !== '23505') throw e; // only throw when its not a unique violation
        }
      }
    });

    it('should return a list of jobs', async () => {
      const jobs = await request({
        url: `/api/jobs`,
        method: 'GET',
      });

      expect(jobs.count).toBe(51);
      expect(jobs.offset).toBe(0);
      expect(jobs.limit).toBe(50);
      expect(jobs.items.length).toBe(50);
    });

    it('should limit jobs list', async () => {

      const jobs = await request({
        url: `/api/jobs`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
      });

      expect(jobs.count).toBe(51);
      expect(jobs.offset).toBe(0);
      expect(jobs.limit).toBe(40);
      expect(jobs.items.length).toBe(40);
    });

    it('should page results', async () => {

      const jobs = await request({
        url: `/api/jobs`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
      });

      expect(jobs.count).toBe(51);
      expect(jobs.offset).toBe(10);
      expect(jobs.limit).toBe(50);
      expect(jobs.items.length).toBe(41);
    });
  });

  describe('POST /api/jobs', () => {
    it('creates a job', async () => {
      const registry = await saveRegistry();
      const namespace = await saveNamespace();

      const response = await request({
        url: '/api/jobs',
        method: 'POST',
        body: {
          name: 'bob',
          namespace: namespace.id,
          registry: registry.name,
        },
      });

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      const job = await store.getJob(response.id);
      expect(job.name).toBe('bob');
      expect(job.namespace.id).toBe(namespace.id);
      expect(job.registry.id).toBe(registry.id);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('retrieves a job', async () => {
      const registry = await saveRegistry();
      const namespace = await saveNamespace();
      const jobId = await store.saveJob('bob', registry, namespace, makeRootMeta());

      const response = await request({
        url: `/api/jobs/${jobId}`,
        method: 'GET',
      });

      expect(response.id).toBe(jobId);
      expect(response.name).toBe('bob');
      expect(response.namespace.id).toBe(namespace.id);
      expect(response.registry.id).toBe(registry.id);
    });

    it('404s for nonexistent job', async () => {
      loggerOptions.suppress = true;

      await request({
        url: `/api/jobs/142bc001-1819-459b-bf95-14e25be17fe5`,
        method: 'GET',
        resolveWithFullResponse: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(404);
      });
    });
  });

  describe('GET /api/jobs/:id/versions', () => {
    let jobId;
    beforeEach(async () => {
      await store.nuke();
      const registry = await saveRegistry();
      const namespace = await saveNamespace();
      jobId = await store.saveJob(makeJob().name, registry, namespace, makeRootMeta());

      let i = 0;
      while (i < 51) {
        await store.saveJobVersion({ id: jobId }, { yaml: 'whatever' }, makeRootMeta());
        i++;
      }
    });

    it('should return a list of job versions', async () => {
      const versions = await request({
        url: `/api/jobs/${jobId}/versions`,
        method: 'GET',
      });

      expect(versions.count).toBe(51);
      expect(versions.offset).toBe(0);
      expect(versions.limit).toBe(50);
      expect(versions.items.length).toBe(50);
    });

    it('should limit versions list', async () => {

      const versions = await request({
        url: `/api/jobs/${jobId}/versions`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
      });

      expect(versions.count).toBe(51);
      expect(versions.offset).toBe(0);
      expect(versions.limit).toBe(40);
      expect(versions.items.length).toBe(40);
    });

    it('should page results', async () => {

      const versions = await request({
        url: `/api/jobs/${jobId}/versions`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
      });

      expect(versions.count).toBe(51);
      expect(versions.offset).toBe(10);
      expect(versions.limit).toBe(50);
      expect(versions.items.length).toBe(41);
    });
  });

  describe('GET /api/jobs/version/:id', () => {
    it('404s for nonexistent version', async () => {
      loggerOptions.suppress = true;

      await request({
        url: `/api/jobs/version/142bc001-1819-459b-bf95-14e25be17fe5`,
        method: 'GET',
        resolveWithFullResponse: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, reason => {
        expect(reason.response.statusCode).toBe(404);
      });
    });

    it('gets a job version by id', async () => {
      const registry = await saveRegistry();
      const namespace = await saveNamespace();
      const jobId = await store.saveJob('a-cronjob', registry, namespace, makeRootMeta());
      const versionId = await store.saveJobVersion({ id: jobId }, { yaml: sampleYaml({ jobId }) }, makeRootMeta());
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

      const response = await request({
        url: `/api/jobs/version/${versionId}`,
        method: 'GET',
      });

      expect(response.id).toBe(versionId);
      expect(response.job.id).toBe(jobId);
      expect(response.yaml).toBe(sampleYaml({ jobId }));
      expect(response.values).toBeDefined();
      expect(response.values).toMatchObject({
        schedule: '0 * * * *',
        labels: [
          { key: 'some/label/bool', value: 'true' },
          { key: 'cronjobName', value: 'a-cronjob-af7b41de' },
          { key: 'cronjobUuid', value: response.job.id }
        ],
        concurrencyPolicy: 'Replace',
        initContainers: [
          {
            name: 'init',
            image: 'busybox',
            command: ['some', 'command'],
            volumeMounts: [{ mountPath: '/cache', name: 'empty' }, { mountPath: '/secret', name: 'job-secret' }]
          }
        ],
        containers: [
          {
            name: 'main',
            image: 'busybox',
            command: ['some', 'other', 'command'],
            volumeMounts: [{ mountPath: '/cache', name: 'empty' }],
            envFrom: [{ secretRef: { name: 'cronjob-a-cronjob-af7b41de' } }],
            envFromSecret: true
          }
        ],
        volumes: [
          { name: 'job-secret', type: 'secret' },
          { name: 'empty', type: 'emptyDir' }
        ],
        secret: {
          secrets: [
            {
              editor: 'simple',
              key: 'a',
              value: 'b',
            },
            {
              editor: 'json',
              key: 'c',
              value: 'd',
            },
          ]
        }
      });
    });
  });

  describe('POST /api/jobs/:id/version', () => {
    it('saves a job version from the form and builds the yaml', async () => {
      const registry = await saveRegistry();
      const namespace = await saveNamespace();
      const jobId = await store.saveJob('a-cronjob', registry, namespace, makeRootMeta());

      const response = await request({
        url: `/api/jobs/${jobId}/version`,
        method: 'POST',
        body: {
          schedule: '0 * * * *',
          labels: [
            { key: 'some/label/bool', value: 'true' },
            { key: 'cronjobName', value: 'a-cronjob' }
          ],
          concurrencyPolicy: 'Replace',
          initContainers: [
            {
              name: 'init',
              image: 'busybox',
              command: ['some', 'command'],
              volumeMounts: [{ mountPath: '/cache', name: 'empty' }, { mountPath: '/secret', name: 'job-secret' }]
            }
          ],
          containers: [
            {
              name: 'main',
              image: 'busybox',
              command: ['some', 'other', 'command'],
              volumeMounts: [{ mountPath: '/cache', name: 'empty' }],
              envFrom: [{ secretRef: { name: 'cronjob-a-cronjob' } }],
              envFromSecret: true
            }
          ],
          volumes: [
            { name: 'job-secret', type: 'secret' },
            { name: 'empty', type: 'emptyDir' }
          ],
          secret: {
            secrets: [
              {
                editor: 'simple',
                key: 'a',
                value: 'b',
              },
              {
                editor: 'json',
                key: 'c',
                value: 'd',
              },
            ]
          }
        },
      });

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      const version = await store.getJobVersion(response.id);
      expect(version.yaml.trim()).toBe(sampleYaml({ jobId }).trim());
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
