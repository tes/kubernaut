import Boom from 'boom';

export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/services', auth('api'));
    app.use('/api/services-with-status-for-namespace/:namespaceId', auth('api'));
    app.use('/api/service/:serviceId/enable-deployment/:namespaceId', auth('api'));
    app.use('/api/service/:serviceId/disable-deployment/:namespaceId', auth('api'));

    app.get('/api/services', async (req, res, next) => {
      try {
        const criteria = {
          registries: req.user.listRegistryIdsWithPermission('registries-read'),
        };
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findServices(criteria, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/services-with-status-for-namespace/:namespaceId', async (req, res, next) => {
      try {
        const { namespaceId } = req.params;
        if (!req.user.hasPermissionOnNamespace(namespaceId, 'namespaces-manage')) return next(Boom.forbidden());
        if (req.user.listRegistryIdsWithPermission('registries-read').length === 0) return next(Boom.forbidden());

        const criteria = {
          registries: req.user.listRegistryIdsWithPermission('registries-read'),
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

    app.post('/api/service/:serviceId/enable-deployment/:namespaceId', async (req, res, next) => {
      try {
        const { namespaceId, serviceId } = req.params;
        const namespace = await store.getNamespace(namespaceId);
        if (!namespace) return next(Boom.notFound());
        if (!req.user.hasPermissionOnNamespace(namespaceId, 'namespaces-manage')) return next(Boom.forbidden());
        const service = await store.getService(serviceId);
        if (!service) return next(Boom.notFound());
        const registryId = service.registry.id;
        if (req.user.listRegistryIdsWithPermission('registries-read').indexOf(registryId) === -1) return next(Boom.forbidden());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        await store.enableServiceForNamespace(namespace, service, { date: new Date(), account: { id: req.user.id } });

        const criteria = {
          registries: req.user.listRegistryIdsWithPermission('registries-read'),
          namespace: namespaceId,
        };

        const page = await store.findServicesAndShowStatusForNamespace(criteria, limit, offset);
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
        if (!req.user.hasPermissionOnNamespace(namespaceId, 'namespaces-manage')) return next(Boom.forbidden());
        const service = await store.getService(serviceId);
        if (!service) return next(Boom.notFound());
        const registryId = service.registry.id;
        if (req.user.listRegistryIdsWithPermission('registries-read').indexOf(registryId) === -1) return next(Boom.forbidden());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        await store.disableServiceForNamespace(namespace, service, { date: new Date(), account: { id: req.user.id } });

        const criteria = {
          registries: req.user.listRegistryIdsWithPermission('registries-read'),
          namespace: namespaceId,
        };

        const page = await store.findServicesAndShowStatusForNamespace(criteria, limit, offset);
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
