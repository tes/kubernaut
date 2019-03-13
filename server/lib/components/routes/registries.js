import bodyParser from 'body-parser';
import Boom from 'boom';

export default function(options = {}) {

  function start({ pkg, app, store, auth }, cb) {

    app.use('/api/registries', auth('api'));

    app.get('/api/registries', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed registries');
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.findRegistries({
          user: { id: req.user.id, permission: 'registries-read' }
        }, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/registries/:id', async (req, res, next) => {
      try {
        if (! await store.hasPermissionOnRegistry(req.user, req.params.id, 'registries-read')) return next(Boom.forbidden());

        const registry = await store.getRegistry(req.params.id);
        if (!registry) return next(Boom.notFound());
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed registry', { registry });
        return res.json(registry);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/registries/:registry/search/:serviceName', async (req, res, next) => {
      try {
        const registry = await store.findRegistry({ name: req.params.registry });
        if (!registry) return next(Boom.notFound());

        if (! await store.hasPermissionOnRegistry(req.user, registry.id, 'registries-read')) return next(Boom.forbidden());

        const results = await store.searchByServiceName(req.params.serviceName, registry);
        return res.json(results);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/registries', bodyParser.json(), async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'registries-write')) return next(Boom.forbidden());

        if (!req.body.name) return next(Boom.badRequest('name is required'));
        const data = { name: req.body.name };
        const meta = { date: new Date(), account: { id: req.user.id } };
        const registry = await store.saveRegistry(data, meta);
        await store.audit(meta, 'saved registry', { registry });
        res.json(registry);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/registries/:id', async (req, res, next) => {
      try {
        if (! await store.hasPermission(req.user, 'registries-write')) return next(Boom.forbidden());
        const registry = await store.getRegistry(req.params.id);
        if (!registry) return next(Boom.notFound());

        const meta = { date: new Date(), account: { id: req.user.id } };
        await store.deleteRegistry(req.params.id, meta);
        await store.audit(meta, 'deleted registry', { registry });
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
