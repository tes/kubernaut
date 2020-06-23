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

    app.post('/api/ingress/host-keys', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { name } = req.body;
        if (!name) return next(Boom.badRequest());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveIngressHostKey(name, meta);

        await store.audit(meta, 'added ingress host key');

        res.json(newId);
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

    app.post('/api/ingress/variable-keys', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { name } = req.body;
        if (!name) return next(Boom.badRequest());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveIngressVariableKey(name, meta);

        await store.audit(meta, 'added ingress variable key');

        res.json(newId);
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

    app.post('/api/ingress/cluster/:id/hosts', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { value, ingressHostKeyId } = req.body;
        if (!value || !ingressHostKeyId) return next(Boom.badRequest());

        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const ingressHostKey = await store.getIngressHostKey(ingressHostKeyId);
        if (!ingressHostKey) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveClusterIngressHostValue(ingressHostKey, cluster, value, meta);

        await store.audit(meta, 'added cluster ingress host value', { cluster });

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.put('/api/ingress/cluster/hosts/:id', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { value } = req.body;
        if (!value ) return next(Boom.badRequest());

        const clusterIngressHost = await store.getClusterIngressHost(req.params.id);
        if (!clusterIngressHost) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.updateClusterIngressHostValue(clusterIngressHost.id, value);

        await store.audit(meta, 'updated cluster ingress host value');

        res.json(newId);
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

    app.post('/api/ingress/cluster/:id/variables', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { value, ingressVariableKeyId } = req.body;
        if (!value || !ingressVariableKeyId) return next(Boom.badRequest());

        const cluster = await store.getCluster(req.params.id);
        if (!cluster) return next(Boom.notFound());

        const ingressVariableKey = await store.getIngressHostKey(ingressVariableKeyId);
        if (!ingressVariableKey) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.saveClusterIngressVariableValue(ingressVariableKey, cluster, value, meta);

        await store.audit(meta, 'added cluster ingress variable value', { cluster });

        res.json(newId);
      } catch (err) {
        next(err);
      }
    });

    app.put('/api/ingress/cluster/variables/:id', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'ingress-admin')) return next(Boom.forbidden());

        const { value } = req.body;
        if (!value ) return next(Boom.badRequest());

        const clusterIngressVariable = await store.getClusterIngressHost(req.params.id);
        if (!clusterIngressVariable) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        const newId = await store.updateClusterIngressVariableValue(clusterIngressVariable.id, value);

        await store.audit(meta, 'updated cluster ingress variable value');

        res.json(newId);
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
