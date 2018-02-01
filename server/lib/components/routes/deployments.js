import bodyParser from 'body-parser';
import hogan from 'hogan.js';
import Boom from 'boom';
import EventEmitter from 'events';
import DeploymentLogEntry from '../../domain/DeploymentLogEntry';
import { safeLoadAll as yaml2json, } from 'js-yaml';

export default function(options = {}) {

  function start({ pkg, app, store, kubernetes, auth, }, cb) {

    app.use('/api/deployments', auth('api'));

    app.get('/api/deployments', async (req, res, next) => {
      try {
        const registries = req.user.listNamespaceIdsWithPermission('deployments-read');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.findDeployments({ registries, }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/deployments/:id', async (req, res, next) => {
      try {
        const deployment = await store.getDeployment(req.params.id);
        if (!deployment) return next(Boom.notFound());
        if (!req.user.hasPermissionOnNamespace(deployment.namespace.id, 'deployments-read')) return next(Boom.forbidden());
        res.json(deployment);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/deployments', bodyParser.json(), async (req, res, next) => {

      try {
        if (!req.body.cluster) return next(Boom.badRequest('cluster is required'));
        if (!req.body.namespace) return next(Boom.badRequest('namespace is required'));
        if (!req.body.registry) return next(Boom.badRequest('registry is required'));
        if (!req.body.service) return next(Boom.badRequest('service is required'));
        if (!req.body.version) return next(Boom.badRequest('version is required'));

        const namespace = await store.findNamespace({ name: req.body.namespace, cluster: req.body.cluster, });
        if (!namespace) return next(Boom.badRequest(`namespace ${req.body.namespace} was not found`));
        if (!req.user.hasPermissionOnNamespace(namespace.id, 'deployments-write')) return next(Boom.forbidden());

        const registry = await store.findRegistry({ name: req.body.registry, });
        if (!registry) return next(Boom.badRequest(`registry ${req.body.registry} was not found`));
        if (!req.user.hasPermissionOnRegistry(registry.id, 'releases-read')) return next(Boom.forbidden());

        const release = await store.findRelease({ registry: req.body.registry, service: req.body.service, version: req.body.version, });
        if (!release) return next(Boom.badRequest(`release ${req.body.registry}/${req.body.service}/${req.body.version} was not found`));

        const contextOk = await kubernetes.checkContext(namespace.cluster.context, res.locals.logger);
        if (!contextOk) return next(Boom.badRequest(`context ${namespace.cluster.context} was not found`));

        const namespaceOk = await kubernetes.checkNamespace(namespace.cluster.context, namespace.name, res.locals.logger);
        if (!namespaceOk) return next(Boom.badRequest(`namespace ${namespace.name} was not found in ${namespace.cluster.name} cluster`));

        const data = { namespace, manifest: getManifest(release, res.locals.logger), release, };
        const meta = { date: new Date(), account: { id: req.user.id, }, };
        const deployment = await store.saveDeployment(data, meta);
        const emitter = new EventEmitter();
        const log = [];

        emitter.on('data', async data => {
          log.push(data);
          res.locals.logger.info(data.content);
          await store.saveDeploymentLogEntry(new DeploymentLogEntry({ deployment, ...data, }));
        }).on('error', async data => {
          log.push(data);
          res.locals.logger.error(data.content);
          await store.saveDeploymentLogEntry(new DeploymentLogEntry({ deployment, ...data, }));
        });

        const applyExitCode = await applyManifest(deployment, emitter);
        if (applyExitCode > 0) {
          return res.status(500).json({ id: deployment.id, status: 'failure', log, });
        } else if (req.query.wait !== 'true') {
          res.status(202).json({ id: deployment.id, status: 'pending', log, });
        }

        req.setTimeout(0);

        const rolloutStatusExitCode = await getRolloutStatus(deployment, emitter);

        if (res.headerSent) return;

        if (rolloutStatusExitCode) {
          res.status(500).json({ id: deployment.id, status: 'failure', log, });
        } else {
          res.status(200).json({ id: deployment.id, status: 'success', log, });
        }
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/deployments/:id', async (req, res, next) => {
      try {
        const deployment = await store.getDeployment(req.params.id);
        if (!deployment) return next(Boom.forbidden());
        if (!req.user.hasPermissionOnNamespace(deployment.namespace.id, 'deployments-write')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id, }, };
        await store.deleteDeployment(req.params.id, meta);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });

    function getManifest(release) {
      const yaml = hogan.compile(release.template.source.yaml).render(release.attributes);
      const json = yaml2json(yaml);
      return { yaml, json, };
    }

    async function applyManifest(deployment, emitter) {
      const code = await kubernetes.apply(
        deployment.namespace.cluster.context,
        deployment.namespace.name,
        deployment.manifest.yaml,
        emitter,
      );
      await store.saveApplyExitCode(deployment.id, code);
      return code;
    }

    async function getRolloutStatus(deployment, emitter) {
      const code = await kubernetes.rolloutStatus(
        deployment.namespace.cluster.context,
        deployment.namespace.name,
        deployment.release.service.name,
        emitter
      );
      await store.saveRolloutStatusExitCode(deployment.id, code);
      return code;
    }

    cb();
  }

  return {
    start,
  };
}
