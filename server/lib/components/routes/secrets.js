import bodyParser from 'body-parser';
import Boom from 'boom';
import parseFilters from './lib/parseFilters';

export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/secrets', auth('api'));

    app.get('/api/secrets/:id', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: { id: req.user.id } };
        const version = await store.getVersionOfSecretById(req.params.id, meta);
        if (!version) return next(Boom.notFound());
        if (! await store.hasPermissionOnNamespace(req.user, version.namespace.id, 'secrets-apply')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnRegistry(req.user, version.service.registry.id, 'registries-read')) return next(Boom.forbidden());

        return res.json(version);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/secrets/:id/with-data', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: { id: req.user.id } };
        const version = await store.getVersionOfSecretWithDataById(req.params.id, meta);
        if (!version) return next(Boom.notFound());
        if (! await store.hasPermissionOnNamespace(req.user, version.namespace.id, 'secrets-manage')) return next(Boom.forbidden());
        if (! await store.hasPermissionOnRegistry(req.user, version.service.registry.id, 'registries-read')) return next(Boom.forbidden());

        return res.json(version);
      } catch (err) {
        next(err);
      }
    });

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

    app.post('/api/secrets/:registry/:service/:namespace', bodyParser.json(), async (req, res, next) => {
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
        if (! await store.hasPermissionOnNamespace(req.user, namespace.id, 'secrets-manage')) return next(Boom.forbidden());

        const meta = { date: new Date(), account: { id: req.user.id } };

        const { comment, secrets: secretsFromBody } = req.body;
        if (!comment) return next(Boom.badRequest('comment is required'));
        if (!Array.isArray(secretsFromBody)) return next(Boom.badRequest('secrets must be an array'));
        secretsFromBody.forEach(secret => { if (typeof secret !== 'object') return next(Boom.badRequest('secret must be an object'));});
        const secrets = secretsFromBody.map(({ key, value, editor }) => ({ key, value, editor }));
        const newVersion = { comment, secrets };

        const result = await store.saveVersionOfSecret(service, namespace, newVersion, meta);
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
