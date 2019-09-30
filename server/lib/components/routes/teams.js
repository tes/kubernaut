// import bodyParser from 'body-parser';
import Boom from 'boom';
import parseFilters from './lib/parseFilters';

export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/teams', auth('api'));

    app.get('/api/teams', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed teams');
        const filters = parseFilters(req.query, ['name', 'createdBy']);
        const criteria = {
          filters,
        };
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const result = await store.findTeams(criteria, limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/teams/:id', async (req, res, next) => {
      try {
        const { id } = req.params;
        const team = await store.getTeam(id, { id: req.user.id, permission: 'registries-read'});

        if (!team) return next(Boom.notFound());
        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed team', { team });
        return res.json(team);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/teams/for/:registry/:service', async (req, res, next) => {
      try {
        const registry = await store.findRegistry({ name: req.params.registry });
        if (!registry) return next(Boom.notFound());
        if (! await store.hasPermissionOnRegistry(req.user, registry.id, 'registries-read')) return next(Boom.forbidden());

        const service = await store.findService({ filters: parseFilters(req.params, ['service', 'registry'], {
          service: 'name'
        }) });
        if (!service) return next(Boom.notFound());

        const team = await store.getTeamForService(service);
        if (!team) return next(Boom.notFound());

        const meta = { date: new Date(), account: req.user };
        await store.audit(meta, 'viewed team', { team });
        return res.json(team);
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
