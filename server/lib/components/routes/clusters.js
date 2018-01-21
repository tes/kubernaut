import bodyParser from 'body-parser';
import Boom from 'boom';

export default function(options = {}) {

  function start({ pkg, app, store, kubernetes, auth, }, cb) {

    app.use('/api/clusters', auth('api'));

    app.get('/api/clusters', async (req, res, next) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.listClusters(limit, offset);

        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/clusters/:id', async (req, res, next) => {
      try {
        const cluster = await store.getCluster(req.params.id);
        return cluster ? res.json(cluster) : next();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/clusters', bodyParser.json(), async (req, res, next) => {
      try {

        if (!req.body.name) return next(Boom.badRequest('name is required'));
        if (!req.body.context) return next(Boom.badRequest('context is required'));

        const contextOk = await kubernetes.checkContext(req.body.context, res.locals.logger);
        if (!contextOk) return next(Boom.badRequest(`Context ${req.body.context} was not found`));

        const clusterOk = await kubernetes.checkCluster(req.body.context, res.locals.logger);
        if (!clusterOk) return next(Boom.badRequest(`Unable to verify cluster using context ${req.body.context}`));

        const data = {
          name: req.body.name,
          context: req.body.context,
        };
        const meta = { date: new Date(), account: { id: req.user.id, }, };
        const cluster = await store.saveCluster(data, meta);
        res.json(cluster);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/clusters/:id', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: { id: req.user.id, }, };
        await store.deleteCluster(req.params.id, meta);
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
