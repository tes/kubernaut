import bodyParser from 'body-parser';
import Boom from 'boom';
import isCSSColorName from 'is-css-color-name';
import isCSSColorHex from 'is-css-color-hex';

export default function(options = {}) {

  function start({ pkg, app, store, kubernetes, auth }, cb) {

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
        if (!req.body.config) return next(Boom.badRequest('config is required'));
        if (!req.body.color) return next(Boom.badRequest('color is required'));

        const priority = req.body.priority ? parseInt(req.body.priority, 10) : undefined;

        const configOk = await kubernetes.checkConfig(req.body.config, res.locals.logger);
        if (!configOk) return next(Boom.badRequest(`Config ${req.body.config} was not found`));

        const clusterOk = await kubernetes.checkCluster(req.body.config, req.body.context, res.locals.logger);
        if (!clusterOk) return next(Boom.badRequest(`Unable to verify cluster`));

        const colorOk = isCSSColorHex(req.body.color) || isCSSColorName(req.body.color);
        if (!colorOk) return next(Boom.badRequest(`Unable to verify color`));

        const updated = await store.updateCluster(cluster.id, {
          name: req.body.name,
          config: req.body.config,
          color: req.body.color,
          priority,
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
        if (!req.body.config) return next(Boom.badRequest('config is required'));
        if (!req.body.color) return next(Boom.badRequest('color is required'));

        const priority = req.body.priority ? parseInt(req.body.priority, 10) : undefined;

        const configOk = await kubernetes.checkConfig(req.body.config, res.locals.logger);
        if (!configOk) return next(Boom.badRequest(`Config ${req.body.config} was not found`));

        const clusterOk = await kubernetes.checkCluster(req.body.config, req.body.context, res.locals.logger);
        if (!clusterOk) return next(Boom.badRequest(`Unable to verify cluster`));

        const colorOk = isCSSColorHex(req.body.color) || isCSSColorName(req.body.color);
        if (!colorOk) return next(Boom.badRequest(`Unable to verify color`));

        const data = {
          name: req.body.name,
          config: req.body.config,
          color: req.body.color,
          priority,
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

    cb();
  }

  return {
    start,
  };
}
