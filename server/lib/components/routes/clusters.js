import bodyParser from 'body-parser';
import Boom from 'boom';
import isCSSColorName from 'is-css-color-name';
import isCSSColorHex from 'is-css-color-hex';
import Promise from 'bluebird';
import { safeLoadAll, safeDump } from 'js-yaml';
import { get as _get, set as _set } from 'lodash';
import hogan from 'hogan.js';
import parseFilters from './lib/parseFilters';
import secretTemplate from './lib/secretTemplate';
import { generateJobSecretYaml } from './lib/jobFunctions';

export default function(options = {}) {

  function start({ pkg, app, store, kubernetes, auth, logger }, cb) {

    app.use('/api/clusters', auth('api'));

    app.get('/api/clusters', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'clusters-read')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed clusters');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.findClusters({}, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/clusters/:id', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'clusters-read')) return next(Boom.forbidden());

        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next();
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed cluster', { cluster });
        res.json(cluster);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/clusters/:id', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'clusters-write')) return next(Boom.forbidden());
        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        if (!req.body.name) return next(Boom.badRequest('name is required'));
        if (req.body.context && !req.body.config) return next(Boom.badRequest('config is required'));
        if (!req.body.color) return next(Boom.badRequest('color is required'));
        if (req.body.config && !req.body.context) return next(Boom.badRequest('context is required'));

        const priority = req.body.priority ? parseInt(req.body.priority, 10) : undefined;

        const configOk = (!req.body.config) || await kubernetes.checkConfig(req.body.config, res.locals.logger);
        if (!configOk) return next(Boom.badRequest(`Config ${req.body.config} was not found`));

        const clusterOk = (!req.body.config && !req.body.context) || await kubernetes.checkCluster(req.body.config, req.body.context, res.locals.logger);
        if (!clusterOk) return next(Boom.badRequest(`Unable to verify cluster`));

        const colorOk = isCSSColorHex(req.body.color) || isCSSColorName(req.body.color);
        if (!colorOk) return next(Boom.badRequest(`Unable to verify color`));

        const updated = await store.updateCluster(cluster.id, {
          name: req.body.name,
          config: req.body.config,
          color: req.body.color,
          priority,
          context: req.body.context,
        });

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'updated cluster', { cluster });
        res.json(updated);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/clusters', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'clusters-write')) return next(Boom.forbidden());

        if (!req.body.name) return next(Boom.badRequest('name is required'));
        if (req.body.context && !req.body.config) return next(Boom.badRequest('config is required'));
        if (!req.body.color) return next(Boom.badRequest('color is required'));
        if (req.body.config && !req.body.context) return next(Boom.badRequest('context is required'));

        const priority = req.body.priority ? parseInt(req.body.priority, 10) : undefined;

        const configOk = (!req.body.config) || await kubernetes.checkConfig(req.body.config, res.locals.logger);
        if (!configOk) return next(Boom.badRequest(`Config ${req.body.config} was not found`));

        const clusterOk = (!req.body.config && !req.body.context) || await kubernetes.checkCluster(req.body.config, req.body.context, res.locals.logger);
        if (!clusterOk) return next(Boom.badRequest(`Unable to verify cluster`));

        const colorOk = isCSSColorHex(req.body.color) || isCSSColorName(req.body.color);
        if (!colorOk) return next(Boom.badRequest(`Unable to verify color`));

        const data = {
          name: req.body.name,
          config: req.body.config,
          color: req.body.color,
          priority,
          context: req.body.context,
        };
        const meta = { date: new Date(), account: { id: req.user.id } };
        const cluster = await store.saveCluster(data, meta);
        await store.audit(meta, 'saved cluster', { cluster });
        res.json(cluster);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/clusters/:id', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'clusters-write')) return next(Boom.forbidden());

        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next();
        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.deleteCluster(req.params.id, meta);
        await store.audit(meta, 'deleted cluster', { cluster });
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/clusters/:id/export', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: { id: req.user.id } };
        const hasGlobalAdmin = !!(await store.rolesForSystem(req.user.id, req.user)).currentRoles.find(({ name, global }) => (name === 'admin' && global));
        if (!hasGlobalAdmin) return next(Boom.forbidden());

        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.badRequest('cluster was not found'));

        const namespaces = await store.findNamespaces({ cluster: cluster.name });

        const byNamespace = await Promise.mapSeries(namespaces.items, async (namespace) => {
          const services = await store.findServicesAndShowStatusForNamespace({
            namespace: namespace.id
          }, 1000);

          const deployments = await Promise.reduce(services.items, async (acc, { service }) => {
            const deploymentsForService = await store.findDeployments({
              filters: parseFilters({
                namespace: namespace.name,
                service: service.name,
                cluster: cluster.name,
                registry: service.registry.name,
              }, ['registry', 'service', 'namespace', 'cluster'])
            }, 1, 0, 'created', 'desc');

            if (deploymentsForService && deploymentsForService.items && deploymentsForService.items.length) {
              acc.push(await store.getDeployment(deploymentsForService.items[0].id));
            }
            return acc;
          }, []);

          const secrets = await Promise.reduce(deployments, async (acc, dep) => {
            if (dep.attributes && dep.attributes.secret) {
              try {
                const version = await store.getVersionOfSecretWithDataById(dep.attributes.secret, meta, { opaque: true });
                acc.push(version);
              } catch (e) {
                logger.warn(`Could not find secretVersion [${dep.attributes.secret}] during export.`);
              }
            }

            return acc;
          }, []);

          const cronjobs = await Promise.reduce((await store.findJobs({
            filters: parseFilters({
              namespace: namespace.name,
              cluster: cluster.name,
            }, ['namespace', 'cluster']),
          }, 1000)).items, async (acc, cronjob) => {
            const latest = await store.getLastAppliedVersion(cronjob);
            if (latest) {
              latest.secrets = await store.getJobVersionSecretWithData(latest.id, meta, { opaque: true });
              acc.push(latest);
            }

            return acc;
          }, []);

          return {
            namespace,
            secrets,
            deployments,
            cronjobs,
          };
        });

        // Try not to block the event loop
        const yamlByNamespace = await Promise.mapSeries(byNamespace, async (data) => {
          const secretsYaml = await Promise.mapSeries(data.secrets, (secret) => hogan.compile(secretTemplate).render(secret));
          const deploymentsYaml = await Promise.mapSeries(data.deployments, (dep) => dep.manifest.yaml);
          const cronjobsYaml = await Promise.reduce(data.cronjobs, (acc, job) => {
            acc.push(job.yaml);
            if(job.secrets) acc.push(generateJobSecretYaml(job, job.secrets));

            return acc;
          }, []);

          return {
            namespace: data.namespace,
            secretsYaml,
            deploymentsYaml,
            cronjobsYaml,
          };
        });

        // Try not to block the event loop
        const namespacedYaml = await Promise.reduce(yamlByNamespace, async (acc, data) => {
          const applyNamespace = (namespacedAcc, yaml) => {
            const docs = safeLoadAll(yaml);
            docs.forEach(doc => {
              if (!_get(doc, 'metadata.namespace')) {
                _set(doc, 'metadata.namespace', data.namespace.name);
              }
            });

            return namespacedAcc.concat(docs.filter(doc => doc).map(doc => safeDump(doc, { lineWidth: 120 })));
          };

          const docs = []
            .concat(await Promise.reduce(data.secretsYaml, applyNamespace, []))
            .concat(await Promise.reduce(data.deploymentsYaml, applyNamespace, []))
            .concat(await Promise.reduce(data.cronjobsYaml, applyNamespace, []));

          return acc.concat(docs);
        }, []);

        res.send(namespacedYaml.join('\n---\n'));
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
