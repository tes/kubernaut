import bodyParser from 'body-parser';
import hogan from 'hogan.js';
import Boom from 'boom';
import { safeLoadAll as yaml2json, } from 'js-yaml';

export default function(options = {}) {

  function start({ pkg, app, store, kubernetes, auth, }, cb) {

    app.use('/api/deployments', auth('api'));

    app.get('/api/deployments', async (req, res, next) => {
      try {
        const namespaces = req.user.permittedNamespaces('deployments-read');
        if (namespaces.length === 0) return next(Boom.forbidden());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.listDeployments(limit, offset); // TODO limit to permitted namesapces

        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/deployments/:id', async (req, res, next) => {
      try {
        const deployment = await store.getDeployment(req.params.id);
        if (!deployment) return next(Boom.forbidden());
        if (!req.user.hasPermissionOnNamespace(deployment.namespace.name, 'deployments-read')) return next(Boom.forbidden());
        res.json(deployment);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/deployments/:id/status', async (req, res, next) => {

      req.setTimeout(0);

      try {
        const deployment = await store.getDeployment(req.params.id);
        if (!deployment) return next(Boom.forbidden());
        if (!req.user.hasPermissionOnNamespace(deployment.namespace.id, 'deployments-read')) return next(Boom.forbidden());

        const contextOk = await kubernetes.checkContext(deployment.namespace.cluster.context, res.locals.logger);
        if (!contextOk) return next(Boom.internal(`Context ${deployment.namespace.cluster.context} was not found`));

        const deploymentOk = await kubernetes.checkDeployment(deployment.namespace.cluster.context, deployment.namespace.name, deployment.release.service.name, res.locals.logger);
        if (!deploymentOk) return next(Boom.internal(`Deployment ${deployment.release.service.name} was not found`));

        const ok = await kubernetes.rolloutStatus(deployment.namespace.cluster.context, deployment.namespace.name, deployment.release.service.name, res.locals.logger);

        return ok ? res.status(200).json({
          id: deployment.id,
          status: 'success',
        }) : res.status(502).json({
          id: deployment.id,
          status: 'failed',
        });
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

        const release = await store.findRelease({ name: req.body.service, registry: req.body.registry, version: req.body.version, });
        if (!release) return next(Boom.badRequest(`release ${req.body.registry}/${req.body.service}/${req.body.version} was not found`));

        const contextOk = await kubernetes.checkContext(namespace.cluster.context, res.locals.logger);
        if (!contextOk) return next(Boom.badRequest(`context ${namespace.cluster.context} was not found`));

        const namespaceOk = await kubernetes.checkNamespace(namespace.cluster.context, namespace.name, res.locals.logger);
        if (!namespaceOk) return next(Boom.badRequest(`namespace ${namespace.name} was not found in ${namespace.cluster.name} cluster`));

        const data = {
          namespace,
          manifest: await getManifest(release, res.locals.logger),
          release,
        };

        const meta = { date: new Date(), account: { id: req.user.id, }, };
        const deployment = await store.saveDeployment(data, meta);
        await kubernetes.apply(deployment);

        if (req.query.wait === 'true') {
          res.redirect(303, `/api/deployments/${deployment.id}/status`);
        } else {
          res.status(202).json({ id: deployment.id, });
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

    function getManifest(release, logger) {
      return new Promise(resolve => {
        const yaml = hogan.compile(release.template.source.yaml).render(release.attributes);
        const json = yaml2json(yaml);
        resolve({ yaml, json, });
      }).catch(err => {
        logger.error(err);
        throw Boom.internal('Error compiling manifest');
      });
    }

    cb();
  }

  return {
    start,
  };
}
