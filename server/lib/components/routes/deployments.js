import bodyParser from 'body-parser';

export default function(options = {}) {

  function start({ pkg, app, prepper, store, kubernetes, }, cb) {

    app.get('/api/deployments', async (req, res, next) => {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
      try {
        const deployments = await store.listDeployments(limit, offset);
        res.json(deployments);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/deployments/:id', async (req, res, next) => {
      try {
        const deployment = await store.getDeployment(req.params.id);
        return deployment ? res.json(deployment) : next();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/deployments', bodyParser.json(), async (req, res, next) => {

      if (!req.body.context) return res.status(400).json({ message: 'context is required', });
      if (!req.body.service) return res.status(400).json({ message: 'service is required', });
      if (!req.body.version) return res.status(400).json({ message: 'version is required', });

      try {
        const release = await store.findRelease({ name: req.body.service, version: req.body.version, });

        if (!release) return res.status(400).json({ message: `Release ${req.body.service}/${req.body.version} was not found`, });

        const data = {
          context: req.body.context,
          // manifest,
          release,
        };
        const meta = {
          date: new Date(),
          user: 'anonymous',
        };

        const deployment = await store.saveDeployment(data, meta);

        res.json({ id: deployment.id, });
      } catch (err) {
        next(err);
      }

    });

    app.delete('/api/deployments/:id', async (req, res, next) => {
      try {
        await store.deleteDeployment(req.params.id, { date: new Date(), user: 'anonymous', });
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
