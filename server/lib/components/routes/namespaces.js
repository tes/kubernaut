import bodyParser from 'body-parser';
import Boom from 'boom';
import isCSSColorName from 'is-css-color-name';
import isCSSColorHex from 'is-css-color-hex';

export default function(options = {}) {

  function start({ pkg, app, store, kubernetes, auth }, cb) {

    app.use('/api/namespaces', auth('api'));

    app.get('/api/namespaces', async (req, res, next) => {
      try {
        const namespaces = req.user.listNamespaceIdsWithPermission('namespaces-read');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.findNamespaces({ namespaces }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/namespaces/:id', async (req, res, next) => {
      try {
        if (!req.user.hasPermissionOnNamespace(req.params.id, 'namespaces-read')) return next(Boom.forbidden());

        const namespace = await store.getNamespace(req.params.id);
        if (!namespace) return next(Boom.notFound());
        res.json(namespace);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/namespaces', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.user.hasPermission('namespaces-write')) return next(Boom.forbidden());

        if (!req.body.name) return next(Boom.badRequest('name is required'));
        if (!req.body.cluster) return next(Boom.badRequest('cluster is required'));
        if (!req.body.context) return next(Boom.badRequest('context is required'));


        const cluster = await store.findCluster({ name: req.body.cluster });
        if (!cluster) return next(Boom.badRequest(`cluster ${req.body.cluster} was not found`));

        const contextOk = await kubernetes.checkContext(cluster.config, req.body.context, res.locals.logger);
        if (!contextOk) return next(Boom.badRequest(`context ${req.body.context} was not found on ${cluster.name} cluster`));

        const namespaceOk = await kubernetes.checkNamespace(cluster.config, req.body.context, req.body.name, res.locals.logger);
        if (!namespaceOk) return next(Boom.badRequest(`namespace ${req.body.name} was not found on ${cluster.name} cluster`));

        const colorOk = req.body.color && (isCSSColorHex(req.body.color) || isCSSColorName(req.body.color));
        if (req.body.color && !colorOk) return next(Boom.badRequest(`Unable to verify color`));

        const data = { name: req.body.name, cluster, context: req.body.context, color: req.body.color };
        const meta = { date: new Date(), account: { id: req.user.id } };
        const namespace = await store.saveNamespace(data, meta);
        res.json(namespace);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/namespaces/:id', async (req, res, next) => {
      try {
        if (!req.user.hasPermissionOnNamespace(req.params.id, 'namespaces-write')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.deleteNamespace(req.params.id, meta);
        res.status(204).send();
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
