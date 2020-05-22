import bodyParser from 'body-parser';
import Boom from 'boom';
import { safeLoad, safeDump } from 'js-yaml';
import { get as _get, reduce as _reduce } from 'lodash';
import EventEmitter from 'events';
import shortHash from 'short-hash';
import parseFilters from './lib/parseFilters';

const validName = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

const shortNameGenerator = (jobName = '') => `${jobName.substring(0, 10)}-${shortHash(jobName)}`;

function valuesFromYaml(parsed) {
  const { spec } = parsed || {};
  if (!spec) return {};

  return {
    schedule: spec.schedule,
    labels: _reduce(_get(spec, 'jobTemplate.spec.template.metadata.labels', {}), (acc, value, key) => {
      return acc.concat({ key, value });
    }, []),
    concurrencyPolicy: _get(spec, 'concurrencyPolicy', 'Allow'),
    initContainers: _get(spec, 'jobTemplate.spec.template.spec.initContainers', []),
    containers: _get(spec, 'jobTemplate.spec.template.spec.containers', []).map(c => {
      const toReturn = {
        ...c,
      };
      if (_get(c, 'envFrom')) {
        toReturn.envFromSecret = c.envFrom.filter((ef) => ef.secretRef).length > 0;
      }

      return toReturn;
    }),
    volumes: _get(spec, 'jobTemplate.spec.template.spec.volumes', []).map(v => {
      const toReturn = {
        name: v.name,
      };
      if (v.emptyDir) toReturn.type = 'emptyDir';
      if (v.configMap) {
        toReturn.type = 'configMap';
        toReturn.configMap = v.configMap;
      }
      if (v.secret) toReturn.type = 'secret';

      return toReturn;
    }),
  };
}

function buildSpec (values, job) {
  function parseContainer (c) {
    const toReturn = {
      name: c.name || '',
      image: c.image || '',
    };

    const filteredArgs = [].concat(c.args)
      .filter(a => typeof a === 'string')
      .filter(a => a); // Clean out empties
    if (filteredArgs.length) toReturn.args = filteredArgs;
    const filteredCommands = [].concat(c.command)
      .filter(c => typeof c === 'string')
      .filter(c => c); // Clean out empties
    if (filteredCommands.length) toReturn.command = filteredCommands;

    if (c.volumeMounts) toReturn.volumeMounts = c.volumeMounts;

    if (c.envFromSecret) toReturn.envFrom = [{
      secretRef: {
        name: `cronjob-${shortNameGenerator(job.name)}`,
      }
    }];

    return toReturn;
  }

  function parseVolume (v) {
    const toReturn = {
      name: v.name || '',
    };

    if (v.type === 'emptyDir') {
      toReturn.emptyDir = {};
    } else if (v.type === 'configMap') {
      toReturn.configMap = {
        name: _get(v, 'configMap.name', ''),
      };
    } else if (v.type === 'secret') {
      toReturn.secret = {
        secretName: `cronjob-${shortNameGenerator(job.name)}`,
      };
    }

    return toReturn;
  }

  function parseLabels (formValues) {
    return {
      ...formValues.reduce((acc, label) => {
        acc[label.key] = label.value || '';
        return acc;
      }, {}),
      cronjobName: shortNameGenerator(job.name),
      cronjobUuid: job.id,
    };
  }

  return {
    apiVersion: 'batch/v1beta1',
    kind: 'CronJob',
    metadata: {
      name: shortNameGenerator(job.name),
    },
    spec: {
      schedule: values.schedule || '',
      concurrencyPolicy: values.concurrencyPolicy || '',
      jobTemplate: {
        spec: {
          template: {
            metadata: {
              labels: parseLabels(values.labels || []),
            },
            spec: {
              initContainers: (values.initContainers || []).map(parseContainer),
              containers: (values.containers || []).map(parseContainer),
              volumes: (values.volumes || []).map(parseVolume),
              restartPolicy: 'OnFailure',
            }
          }
        }
      }
    }
  };
}

function buildJobSpecFromCronJob (cronJob) {
  const spec = _get(cronJob, 'spec.jobTemplate.spec');
  const name = _get(cronJob, 'metadata.name');

  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      ...spec.template.metadata,
      name: `${name}-${(new Date()).getTime()}`
    },
    spec: {
      ...spec,
      ttlSecondsAfterFinished: 30 * 60,
    },
  };
}

function generateJobSecretYaml(jobVersion, secretData) {
  const doc = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: `cronjob-${shortNameGenerator(jobVersion.job.name)}`,
    },
    type: 'Opaque',
    data: secretData.reduce((acc, secret) => {
      return {
        ...acc,
        [secret.key]: secret.value,
      };
    }, {}),
  };

  return safeDump(doc, { lineWidth: 120 });
}

export default function() {
  function start({ app, store, auth, kubernetes, logger }, cb) {
    app.use('/api/jobs', auth('api'));

    app.get('/api/jobs', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed jobs');
        const filters = parseFilters(req.query, ['name', 'namespace', 'cluster']);
        const criteria = {
          user: { id: req.user.id, permission: 'jobs-read' },
          filters,
        };
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const sort = req.query.sort ? req.query.sort : 'name';
        const order = req.query.order ? req.query.order : 'asc';

        const result = await store.findJobs(criteria, limit, offset, sort, order);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/jobs', bodyParser.json(), async (req, res, next) => {
      try {
        const { name, namespace: namespaceId, registry: registryName } = req.body;

        if (!name || !namespaceId || !registryName) return next(Boom.badRequest());
        if (!name.match(validName)) return next(Boom.badRequest());

        const registry = await store.findRegistry({ name: registryName });
        if (!registry) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, registry.id, 'jobs-write')) return next(Boom.forbidden());

        const namespace = await store.getNamespace(namespaceId);
        if (!namespace) return next(Boom.notFound());
        if (! await store.hasPermissionOnNamespace(req.user, namespace.id, 'jobs-write')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };

        const newJobId = await store.saveJob(name, registry, namespace, meta);

        await store.audit(meta, 'saved new job', { job: { id: newJobId } });

        return res.json({ id: newJobId });
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/jobs/:id', async (req, res, next) => {
      try {
        const { id } = req.params;
        const job = await store.getJob(id);
        if (!job) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, job.registry.id, 'jobs-read')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed job', { job });
        return res.json(job);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/jobs/:id/snapshot', async (req, res, next) => {
      try {
        const { id } = req.params;
        const job = await store.getJob(id);
        if (!job) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, job.registry.id, 'jobs-read')) return next(Boom.forbidden());

        const namespace = await store.getNamespace(job.namespace.id);

        const output = await kubernetes.getLastLogsForCronjob(namespace.cluster.config, namespace.context, namespace.name, shortNameGenerator(job.name), logger);

        return res.json(output);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/jobs/:id/versions', async (req, res, next) => {
      try {
        const { id } = req.params;
        const job = await store.getJob(id);
        if (!job) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, job.registry.id, 'jobs-read')) return next(Boom.forbidden());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed job versions', { job });

        const result = await store.findJobVersions(job, limit, offset);
        return res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/jobs/version/:id', async (req, res, next) => {
      try {
        const { id } = req.params;
        const jobVersion = await store.getJobVersion(id);
        if (!jobVersion) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, jobVersion.job.registry.id, 'jobs-read')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed job version', { jobVersion });

        jobVersion.values = valuesFromYaml(safeLoad(jobVersion.yaml || ''));
        jobVersion.values.secret = {
          secrets: await store.getJobVersionSecretWithData(jobVersion.id, meta),
        };
        return res.json(jobVersion);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/jobs/:id/version', bodyParser.json(), async (req, res, next) => {
      try {
        const { id } = req.params;
        const job = await store.getJob(id);
        if (!job) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, job.registry.id, 'jobs-write')) return next(Boom.forbidden());

        const values = req.body || {};
        const spec = buildSpec(values, job);
        const yaml = safeDump(spec, { lineWidth: 120 });
        const meta = { date: new Date(), account: req.user };

        const newVersionId = await store.saveJobVersion(job, { yaml }, meta);

        const secretsFromBody = _get(values, 'secret.secrets');
        if (secretsFromBody) {
          if (!Array.isArray(secretsFromBody)) return next(Boom.badRequest('secrets must be an array'));
          secretsFromBody.forEach(secret => { if (typeof secret !== 'object') return next(Boom.badRequest('secret must be an object'));});
          const secrets = secretsFromBody.map(({ key, value, editor }) => ({ key, value, editor }));
          await store.saveJobVersionOfSecret(newVersionId, { secrets }, meta);
        }

        await store.audit(meta, 'saved new job version', { jobVersion: { id: newVersionId} });


        return res.json({ id: newVersionId });
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/jobs/preview-values', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'jobs-read')) return next(Boom.forbidden());
        const values = req.body || {};

        const spec = buildSpec(values, { id: 'preview-uuid', name: 'preview' });
        const yaml = safeDump(spec, { lineWidth: 120 });

        return res.json({ yaml });
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/jobs/:id/execute', async (req, res, next) => {
      try {
        const { id } = req.params;
        const job = await store.getJob(id);
        if (!job) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, job.registry.id, 'jobs-read')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnNamespace(req.user, job.namespace.id, 'jobs-apply')) return next(Boom.forbidden());

        const namespace = await store.getNamespace(job.namespace.id); // Need richer version
        const meta = { date: new Date(), account: req.user };

        let lastApplied = await store.getLastAppliedVersion(job);
        if (!lastApplied) { // Get the latest version instead if this job has never had an applied configuration.
          const versions = await store.findJobVersions(job, 1);
          if (!versions.count) return next(Boom.badRequest());
          lastApplied = await store.getJobVersion(versions.items[0].id);
        }
        if (!lastApplied) return next(Boom.badRequest());

        const cronSpec = safeLoad(lastApplied.yaml || '');
        const jobSpec = buildJobSpecFromCronJob(cronSpec);

        const yamlDocs = [safeDump(jobSpec, { lineWidth: 120 })];

        const jobVersionSecrets = await store.getJobVersionSecretWithData(lastApplied.id, meta, { opaque: true });

        if (jobVersionSecrets) {
          yamlDocs.push(generateJobSecretYaml(lastApplied, jobVersionSecrets));
        }

        const emitter = new EventEmitter();
        const log = [];

        emitter.on('data', async data => {
          log.push(data);
          res.locals.logger.info(data.content);
        }).on('error', async data => {
          log.push(data);
          res.locals.logger.error(data.content);
        });

        const applyExitCode = await kubernetes.apply(
          namespace.cluster.config,
          namespace.context,
          namespace.name,
          yamlDocs.join('---\n'),
          emitter,
        );
        await store.audit(meta, 'manually executed job version', { jobVersion: lastApplied, job });

        if (applyExitCode === 0) {
          return res.status(200).json({ log });
        } else {
          return res.status(500).json({ log });
        }
      } catch (err) {
        next(err);
      }
    });


    app.post('/api/jobs/version/:id/apply', async (req, res, next) => {
      try {
        const { id } = req.params;
        const jobVersion = await store.getJobVersion(id);
        if (!jobVersion) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, jobVersion.job.registry.id, 'jobs-read')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnNamespace(req.user, jobVersion.job.namespace.id, 'jobs-apply')) return next(Boom.forbidden());

        const namespace = await store.getNamespace(jobVersion.job.namespace.id); // Need richer version
        const meta = { date: new Date(), account: req.user };

        const yamlDocs = [jobVersion.yaml];

        const jobVersionSecrets = await store.getJobVersionSecretWithData(jobVersion.id, meta, { opaque: true });

        if (jobVersionSecrets) {
          yamlDocs.push(generateJobSecretYaml(jobVersion, jobVersionSecrets));
        }

        const emitter = new EventEmitter();
        const log = [];

        emitter.on('data', async data => {
          log.push(data);
          res.locals.logger.info(data.content);
        }).on('error', async data => {
          log.push(data);
          res.locals.logger.error(data.content);
        });

        await store.setJobVersionLastApplied(jobVersion, meta);
        const applyExitCode = await kubernetes.apply(
          namespace.cluster.config,
          namespace.context,
          namespace.name,
          yamlDocs.join('---\n'),
          emitter,
        );
        await store.audit(meta, 'applied job version', { jobVersion, job: jobVersion.job });


        if (applyExitCode === 0) {
          return res.status(200).json({ log });
        } else {
          return res.status(500).json({ log });
        }
      } catch (err) {
        next(err);
      }
    });

    cb();
  }

  return {
    start,
  };
}
