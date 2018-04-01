import bodyParser from 'body-parser';
import Boom from 'boom';

export default function(options = {}) {

  function start({ pkg, app, store, auth, }, cb) {

    app.use('/api/registries', auth('api'));

    app.get('/api/registries', async (req, res, next) => {
      try {
        const ids = req.user.listRegistryIdsWithPermission('registries-read');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.findRegistries({ ids, }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/registries/:id', async (req, res, next) => {
      try {
        if (!req.user.hasPermissionOnRegistry(req.params.id, 'registries-read')) return next(Boom.forbidden());

        const registry = await store.getRegistry(req.params.id);
        if (!registry) return next(Boom.notFound());
        return res.json(registry);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/registries', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.user.hasPermission('registries-write')) return next(Boom.forbidden());

        if (!req.body.name) return next(Boom.badRequest('name is required'));
        const data = { name: req.body.name, };
        const meta = { date: new Date(), account: { id: req.user.id, }, };
        const registry = await store.saveRegistry(data, meta);
        res.json(registry);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/registries/:id', async (req, res, next) => {
      try {
        if (!req.user.hasPermission('registries-write')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id, }, };
        await store.deleteRegistry(req.params.id, meta);
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
