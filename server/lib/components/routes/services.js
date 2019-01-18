import Boom from 'boom';
import parseFilters from './lib/parseFilters';

export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/services', auth('api'));
    app.use('/api/services-with-status-for-namespace/:namespaceId', auth('api'));
    app.use('/api/service/:serviceId/enable-deployment/:namespaceId', auth('api'));
    app.use('/api/service/:serviceId/disable-deployment/:namespaceId', auth('api'));

    app.get('/api/services', async (req, res, next) => {
      try {
        const filters = parseFilters(req.query, ['name', 'createdBy', 'registry']);
        const criteria = {
          user: { id: req.user.id, permission: 'registries-read' },
          filters,
        };
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const sort = req.query.sort ? req.query.sort : 'name';
        const order = req.query.order ? req.query.order : 'asc';

        const result = await store.findServices(criteria, limit, offset, sort, order);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/services/:registry/:service', async (req, res, next) => {
      try {
        const registry = await store.findRegistry({ name: req.params.registry });
        if (!registry) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, registry.id, 'registries-read')) return next(Boom.forbidden());

        const service = await store.findService({ filters: parseFilters(req.params, ['service', 'registry'], {
          service: 'name'
        }) });
        if (!service) return next(Boom.notFound());

        return res.json(service);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/services-with-status-for-namespace/:namespaceId', async (req, res, next) => {
      try {
        const { namespaceId } = req.params;
        if (! await store.hasPermissionOnNamespace(req.user, namespaceId, 'namespaces-manage')) return next(Boom.forbidden());

        const criteria = {
          user: { id: req.user.id, permission: 'registries-read' },
          namespace: namespaceId,
        };
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findServicesAndShowStatusForNamespace(criteria, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/services/:registry/:service/namespace-status', async (req, res, next) => {
      try {
        if (! await store.hasPermissionOnAnyOfSubjectType(req.user, 'namespace', 'namespaces-manage')) return next(Boom.forbidden());

        const registry = await store.findRegistry({ name: req.params.registry });
        if (!registry) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, registry.id, 'registries-read')) return next(Boom.forbidden());

        const service = await store.findService({ filters: parseFilters(req.params, ['service', 'registry'], {
          service: 'name'
        }) });
        if (!service) return next(Boom.notFound());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.serviceDeployStatusForNamespaces(service.id, req.user, limit, offset);

        return res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/service/:serviceId/enable-deployment/:namespaceId', async (req, res, next) => {
      try {
        const { namespaceId, serviceId } = req.params;
        const namespace = await store.getNamespace(namespaceId);
        if (!namespace) return next(Boom.notFound());
        if (! await store.hasPermissionOnNamespace(req.user, namespaceId, 'namespaces-manage')) return next(Boom.forbidden());
        const service = await store.getService(serviceId);
        if (!service) return next(Boom.notFound());
        const registryId = service.registry.id;
        if (! await store.hasPermissionOnRegistry(req.user, registryId, 'registries-read')) return next(Boom.forbidden());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const fetchNamespaces = req.query.fetchNamespaces === "true";

        await store.enableServiceForNamespace(namespace, service, { date: new Date(), account: { id: req.user.id } });

        const criteria = {
          user: { id: req.user.id, permission: 'registries-read' },
          namespace: namespaceId,
        };

        const page = await (fetchNamespaces ? store.serviceDeployStatusForNamespaces(service.id, req.user, limit, offset)
          : store.findServicesAndShowStatusForNamespace(criteria, limit, offset));
        res.json(page);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/service/:serviceId/disable-deployment/:namespaceId', async (req, res, next) => {
      try {
        const { namespaceId, serviceId } = req.params;
        const namespace = await store.getNamespace(namespaceId);
        if (!namespace) return next(Boom.notFound());
        if (! await store.hasPermissionOnNamespace(req.user, namespaceId, 'namespaces-manage')) return next(Boom.forbidden());
        const service = await store.getService(serviceId);
        if (!service) return next(Boom.notFound());
        const registryId = service.registry.id;
        if (! await store.hasPermissionOnRegistry(req.user, registryId, 'registries-read')) return next(Boom.forbidden());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const fetchNamespaces = req.query.fetchNamespaces === "true";

        await store.disableServiceForNamespace(namespace, service, { date: new Date(), account: { id: req.user.id } });

        const criteria = {
          user: { id: req.user.id, permission: 'registries-read' },
          namespace: namespaceId,
        };

        const page = await (fetchNamespaces ? store.serviceDeployStatusForNamespaces(service.id, req.user, limit, offset)
          : store.findServicesAndShowStatusForNamespace(criteria, limit, offset));
        res.json(page);
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
