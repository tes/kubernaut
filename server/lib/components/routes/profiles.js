import bodyParser from 'body-parser';

export default function(options = {}) {

  function start({ pkg, app, prepper, store, }, cb) {

    app.get('/api/profiles', async (req, res, next) => {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
      try {
        const profiles = await store.listProfiles(limit, offset);
        res.json(profiles);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/profiles/:id', async (req, res, next) => {
      try {
        const profile = await store.getProfile(req.params.id);
        return profile ? res.json(profile) : next();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/profiles', bodyParser.json(), async (req, res, next) => {

      if (!req.body.name) return res.status(400).json({ message: 'name is required', });
      if (!req.body.version) return res.status(400).json({ message: 'version is required', });

      const data = {
        name: req.body.name,
        version: req.body.version,
        attributes: req.body,
      };
      const meta = {
        date: new Date(),
        user: 'anonymous',
      };

      try {
        const profile = await store.saveProfile(data, meta);
        res.json({ id: profile.id, });
      } catch(err) {
        next(err);
      }
    });

    app.delete('/api/profiles/:id', async (req, res, next) => {
      try {
        await store.deleteProfile(req.params.id, { date: new Date(), user: 'anonymous', });
        res.status(202).send();
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
