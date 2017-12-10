import bodyParser from 'body-parser';
import hogan from 'hogan.js';
import Boom from 'boom';
import { safeLoadAll as yaml2json, } from 'js-yaml';

export default function(options = {}) {

  function start({ pkg, app, store, kubernetes, auth, }, cb) {

    app.use('/api/deployments', auth('api'));

    app.get('/api/deployments', async (req, res, next) => {
      try {
        if (!req.user.hasPermission('placeholder', 'deployments-read')) return next(Boom.forbidden());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const deployments = await store.listDeployments(limit, offset);
        res.json(deployments);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/deployments/:id', async (req, res, next) => {
      try {
        if (!req.user.hasPermission('placeholder', 'deployments-read')) return next(Boom.forbidden());

        const deployment = await store.getDeployment(req.params.id);
        return deployment ? res.json(deployment) : next();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/deployments', bodyParser.json(), async (req, res, next) => {


      try {
        if (!req.user.hasPermission('placeholder', 'deployments-write')) return next(Boom.forbidden());

        if (!req.body.context) return next(Boom.badRequest('context is required'));
        if (!req.body.service) return next(Boom.badRequest('service is required'));
        if (!req.body.version) return next(Boom.badRequest('version is required'));

        const release = await store.findRelease({ name: req.body.service, version: req.body.version, });
        if (!release) return next(Boom.badRequest(`Release ${req.body.service}/${req.body.version} was not found`));

        const contextOk = await kubernetes.checkContext(req.body.context, res.locals.logger);
        if (!contextOk) return next(Boom.badRequest(`Context ${req.body.context} was not found`));

        const data = {
          context: req.body.context,
          manifest: await getManifest(release, res.locals.logger),
          release,
        };
        const meta = { date: new Date(), account: req.user.id, };
        const deployment = await store.saveDeployment(data, meta);
        await kubernetes.apply(deployment.context, deployment.manifest.yaml, res.locals.logger);

        if (req.query.wait === 'true') {
          res.redirect(303, `/api/deployments/${deployment.id}/status`);
        } else {
          res.status(202).json({ id: deployment.id, });
        }
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/deployments/:id/status', async (req, res, next) => {

      req.setTimeout(0);

      try {
        if (!req.user.hasPermission('placeholder', 'deployments-write')) return next(Boom.forbidden());

        const deployment = await store.getDeployment(req.params.id);
        if (!deployment) return next();

        const contextOk = await kubernetes.checkContext(deployment.context, res.locals.logger);
        if (!contextOk) return next(Boom.internal(`Context ${deployment.context} was not found`));

        const deploymentOk = await kubernetes.checkDeployment(deployment.context, deployment.release.service.name, res.locals.logger);
        if (!deploymentOk) return next(Boom.internal(`Deployment ${deployment.release.service.name} was not found`));

        const ok = await kubernetes.rolloutStatus(deployment.context, deployment.release.service.name, res.locals.logger);

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

    app.delete('/api/deployments/:id', async (req, res, next) => {
      try {
        if (!req.user.hasPermission('placeholder', 'deployments-write')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user.id, };
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
