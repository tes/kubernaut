import bodyParser from 'body-parser';
import Boom from 'boom';

export default function(options = {}) {

  function start({ pkg, app, store, auth, }, cb) {

    app.use('/api/namespaces', auth('api'));

    app.get('/api/namespaces', async (req, res, next) => {
      try {
        if (!req.user.hasPermission('*', 'namespaces-read')) return next(Boom.forbidden());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.listNamespaces(limit, offset);

        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/namespaces/:id', async (req, res, next) => {
      try {
        if (!req.user.hasPermission('*', 'namespaces-read')) return next(Boom.forbidden());

        const namespace = await store.getNamespace(req.params.id);
        return namespace ? res.json(namespace) : next();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/namespaces', bodyParser.json(), async (req, res, next) => {
      try {

        if (!req.body.name) return next(Boom.badRequest('name is required'));

        if (!req.user.hasPermission('*', 'namespaces-write')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user.id, };
        const data = {
          name: req.body.name,
        };
        const namespace = await store.saveNamespace(data, meta);
        res.json(namespace);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/namespaces/:id', async (req, res, next) => {
      try {
        if (!req.user.hasPermission('*', 'namespaces-write')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: req.user.id, };
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
