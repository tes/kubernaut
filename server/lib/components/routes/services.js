export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/services', auth('api'));

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

    cb();
  }

  return {
    start,
  };
}
