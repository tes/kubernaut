import bodyParser from 'body-parser';
import hogan from 'hogan.js';
import Boom from 'boom';
import EventEmitter from 'events';
import DeploymentLogEntry from '../../domain/DeploymentLogEntry';
import { safeLoadAll as yaml2json } from 'js-yaml';
import parseFilters from './lib/parseFilters';

export default function(options = {}) {

  function start({ pkg, app, store, kubernetes, auth, logger }, cb) {

    app.use('/api/deployments', auth('api'));

    app.get('/api/deployments', async (req, res, next) => {
      const namespaceIds = req.user.listNamespaceIdsWithPermission('deployments-read');
      try {
        const filters = parseFilters(req.query, ['registry', 'service', 'version', 'namespace', 'cluster']);
        const criteria = {
          filters,
          namespaces: namespaceIds,
        };

        if (req.query.hasOwnProperty('hasNotes') && req.query.hasNotes !== '') {
          criteria['hasNotes'] = req.query.hasNotes === 'true';
        }
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const sort = req.query.sort ? req.query.sort : 'created';
        const order = req.query.order ? req.query.order : 'asc';

        const result = await store.findDeployments(criteria, limit, offset, sort, order);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/deployments/:id', async (req, res, next) => {
      try {
        const deployment = await store.getDeployment(req.params.id);
        if (!deployment) return next(Boom.notFound());
        if (! await store.hasPermissionOnNamespace(req.user, deployment.namespace.id, 'deployments-read')) return next(Boom.forbidden());
        res.json(deployment);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/deployments/latest-by-namespace/:registry/:service', async (req, res, next) => {
      try {
        const registry = await store.findRegistry({ name: req.params.registry });
        const namespaces = req.user.listNamespaceIdsWithPermission('deployments-read');

        if(!req.user.hasPermissionOnRegistry(registry.id, 'registries-read')) return next(Boom.forbidden());

        const deployments = await store.findLatestDeploymentsByNamespaceForService(registry.id, req.params.service, namespaces);
        res.json(deployments);
      } catch(err) {
        next(err);
      }
    });

    app.post('/api/deployments', bodyParser.json(), async (req, res, next) => {

      try {
        if (!req.body.cluster) return next(Boom.badRequest('cluster is required'));
        if (!req.body.registry) return next(Boom.badRequest('registry is required'));
        if (!req.body.service) return next(Boom.badRequest('service is required'));
        if (!req.body.version) return next(Boom.badRequest('version is required'));
        const release = await store.findRelease({ registry: req.body.registry, service: req.body.service, version: req.body.version });
        if (!release) return next(Boom.badRequest(`release ${req.body.registry}/${req.body.service}/${req.body.version} was not found`));

        const releaseDefaultNamespace = release.attributes.namespace;
        const deploymentNamespace = req.body.namespace || releaseDefaultNamespace;
        if (!deploymentNamespace) return next(Boom.badRequest('namespace is required'));

        const namespace = await store.findNamespace({ name: deploymentNamespace, cluster: req.body.cluster })
          .then((namespace) => namespace ? store.getNamespace(namespace.id) : namespace);
        if (!namespace) return next(Boom.badRequest(`namespace ${deploymentNamespace} was not found`));
        if (! await store.hasPermissionOnNamespace(req.user, namespace.id, 'deployments-write')) return next(Boom.forbidden());

        const registry = await store.findRegistry({ name: req.body.registry });
        if (!registry) return next(Boom.badRequest(`registry ${req.body.registry} was not found`));
        if (!req.user.hasPermissionOnRegistry(registry.id, 'releases-read')) return next(Boom.forbidden());

        const contextOk = await kubernetes.checkContext(namespace.cluster.config, namespace.context, res.locals.logger);
        if (!contextOk) return next(Boom.badRequest(`context ${namespace.context} was not found`));

        const namespaceOk = await kubernetes.checkNamespace(namespace.cluster.config, namespace.context, namespace.name, res.locals.logger);
        if (!namespaceOk) return next(Boom.badRequest(`namespace ${namespace.name} was not found in ${namespace.cluster.name} cluster`));

        const serviceCanDeploytoNamespace = await store.checkServiceCanDeploytoNamespace(namespace, release.service);
        if (!serviceCanDeploytoNamespace) return next(Boom.badRequest(`service ${release.service.name} is not allowed to deploy to namespace ${namespace.name}`));

        const streamResults = !!req.query.wait;

        const attributes = Object.assign({}, namespace.attributes, release.attributes, req.body);
        const manifest = getManifest(release, attributes);
        const data = { namespace, manifest, release, attributes };
        const meta = { date: new Date(), account: { id: req.user.id } };
        const deployment = await store.saveDeployment(data, meta);
        const emitter = new EventEmitter();
        const log = [];

        emitter.on('data', async data => {
          if (streamResults) res.write(data.content);
          log.push(data);

          res.locals.logger.info(data.content);
          await store.saveDeploymentLogEntry(new DeploymentLogEntry({ deployment, ...data }));
        }).on('error', async data => {
          if (streamResults) res.write(data.content);
          log.push(data);

          res.locals.logger.error(data.content);
          await store.saveDeploymentLogEntry(new DeploymentLogEntry({ deployment, ...data }));
        });

        if (streamResults) res.write(`${JSON.stringify({ id: deployment.id })}\n`);
        const applyExitCode = await applyManifest(deployment, emitter);
        let rolloutStatusExitCodePromise;

        if (applyExitCode === 0) {
          rolloutStatusExitCodePromise = getRolloutStatus(deployment, emitter, streamResults);
          if (!streamResults) return res.status(202).json({ id: deployment.id, status: 'pending', log });
        } else {
          if (!streamResults) return res.status(500).json({ id: deployment.id, status: 'failure', log });

          res.write('ERROR');
          return res.end();
        }

        req.setTimeout(0);
        const rolloutStatusExitCode = await rolloutStatusExitCodePromise;

        const finalResponse = {
          id: deployment.id,
          status: rolloutStatusExitCode ? 'failure' : 'success',
          log
        };

        if (streamResults) {
          res.write(JSON.stringify(finalResponse));
          return res.end();
        }

        if (rolloutStatusExitCode) {
          res.status(500).json(finalResponse);
        } else {
          res.status(200).json({ id: deployment.id, status: 'success', log });
        }
        res.status(200).json({});
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/deployments/:id/note', bodyParser.json(), async (req, res, next) => {
      try {
        const deployment = await store.getDeployment(req.params.id);
        if (!deployment) return next(Boom.forbidden());
        if (! await store.hasPermissionOnNamespace(req.user, deployment.namespace.id, 'deployments-write')) return next(Boom.forbidden());
        if (req.body.note === undefined) return next(Boom.badRequest('note is required'));
        if (typeof req.body.note !== 'string') return next(Boom.badRequest('note must be a string'));
        const result = await store.setDeploymentNote(deployment.id, req.body.note);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/deployments/:id', async (req, res, next) => {
      try {
        const deployment = await store.getDeployment(req.params.id);
        if (!deployment) return next(Boom.forbidden());
        if (! await store.hasPermissionOnNamespace(req.user, deployment.namespace.id, 'deployments-write')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.deleteDeployment(req.params.id, meta);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });

    function getManifest(release, attributes) {
      const yaml = hogan.compile(release.template.source.yaml).render(attributes);
      const json = yaml2json(yaml);
      return { yaml, json };
    }

    async function applyManifest(deployment, emitter) {
      const code = await kubernetes.apply(
        deployment.namespace.cluster.config,
        deployment.namespace.context,
        deployment.namespace.name,
        deployment.manifest.yaml,
        emitter,
      );
      await store.saveApplyExitCode(deployment.id, code);
      return code;
    }

    async function getRolloutStatus(deployment, emitter, requiresDripFeed) {
      let dripFeed;
      if (requiresDripFeed) dripFeed = setInterval(() => emitter.emit('data', { writtenOn: new Date(), writtenTo: 'stdout', content: '<ignore me - prevents connection timeout>' }), 20 * 1000);

      try {
        const code = await kubernetes.rolloutStatus(
          deployment.namespace.cluster.config,
          deployment.namespace.context,
          deployment.namespace.name,
          deployment.release.service.name,
          emitter
        );

        await store.saveRolloutStatusExitCode(deployment.id, code);
        clearInterval(dripFeed);
        return code;
      } catch (e) {
        logger.error('Error getting rollout status', e);
        clearInterval(dripFeed);
        return Promise.reject(e);
      }
    }

    cb();
  }

  return {
    start,
  };
}
