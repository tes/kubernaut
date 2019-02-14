import Boom from 'boom';
import parseFilters from './lib/parseFilters';

export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/secrets', auth('api'));

    app.get('/api/secrets/:registry/:service/:namespace', async (req, res, next) => {
      try {
        const registry = await store.findRegistry({ name: req.params.registry });
        if (!registry) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, registry.id, 'registries-read')) return next(Boom.forbidden());

        const service = await store.findService({ filters: parseFilters(req.params, ['service', 'registry'], {
          service: 'name'
        }) });
        if (!service) return next(Boom.notFound());

        const namespace = await store.getNamespace(req.params.namespace);
        if (!namespace) return next(Boom.notFound());
        if (! await store.hasPermissionOnNamespace(req.user, namespace.id, 'secrets-apply')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id } };
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.listVersionsOfSecret(service, namespace, meta, limit, offset);
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
