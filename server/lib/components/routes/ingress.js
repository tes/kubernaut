import bodyParser from 'body-parser';
import Boom from 'boom';
// import { get as _get, reduce as _reduce } from 'lodash';


export default function() {
  function start({ app, store, auth, kubernetes, logger }, cb) {
    app.use('/api/ingress', auth('api'));

    app.get('/api/ingress/host-keys', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress host keys');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findIngressHostKeys(limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/variable-keys', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress variable keys');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findIngressVariableKeys(limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/cluster/:id/hosts', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress host values for cluster', { cluster });
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findClusterIngressHosts({ cluster: cluster.id }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/ingress/cluster/:id/variables', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-read')) return next(Boom.forbidden());
        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed ingress variable values for cluster', { cluster });
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findClusterIngressVariables({ cluster: cluster.id }, limit, offset);
        res.json(result);
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
