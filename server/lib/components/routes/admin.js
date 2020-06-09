import Boom from 'boom';
import bodyParser from 'body-parser';

export default function(options = {}) {
  function start({ app, store, auth }, cb) {
    app.use('/api/admin', auth('api'));


    app.get('/api/admin/summary', async (req, res, next) => {
      try {
        const hasGlobalAdmin = !!(await store.rolesForSystem(req.user.id, req.user)).currentRoles.find(({ name, global }) => (name === 'admin' && global));
        if (!hasGlobalAdmin) return next(Boom.forbidden());

        const accounts = await store.findAccounts({}, 1);
        const clusters = await store.findClusters({}, 1);
        const deployments = await store.findDeployments({}, 1);
        const jobs = await store.findJobs({}, 1);
        const namespaces = await store.findNamespaces({}, 1);
        const registries = await store.findRegistries({}, 1);
        const releases = await store.findReleases({}, 1);
        const services = await store.findServices({}, 1);
        const teams = await store.findTeams({}, 1);

        res.json({
          accounts: accounts.count,
          clusters: clusters.count,
          deployments: deployments.count,
          jobs: jobs.count,
          namespaces: namespaces.count,
          registries: registries.count,
          releases: releases.count,
          services: services.count,
          teams: teams.count,
        });
      } catch (err) {
        next(err);
      }
    });

    const deletedTypeLookup = {
      account: {
        find: store.findAccounts,
        restore: store.restoreAccount,
      },
      cluster: {
        find: store.findClusters,
        restore: store.restoreCluster,
      },
      job: {
        find: store.findJobs,
        restore: store.restoreJob,
      },
      namespace: {
        find: store.findNamespaces,
        restore: store.restoreNamespace,
      },
      service: {
        find: store.findServices,
        restore: store.restoreService,
      },
      team: {
        find: store.findTeams,
        restore: store.restoreTeam,
      },
    };

    app.get('/api/admin/deleted', async (req, res, next) => {
      try {
        const hasGlobalAdmin = !!(await store.rolesForSystem(req.user.id, req.user)).currentRoles.find(({ name, global }) => (name === 'admin' && global));
        if (!hasGlobalAdmin) return next(Boom.forbidden());

        if (!req.query.type || (Object.keys(deletedTypeLookup).indexOf(req.query.type) === -1)) return next(Boom.badRequest());

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const results = await deletedTypeLookup[req.query.type].find({ deleted: true }, limit, offset);
        res.json(results);
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/admin/restore', bodyParser.json(), async (req, res, next) => {
      try {
        const hasGlobalAdmin = !!(await store.rolesForSystem(req.user.id, req.user)).currentRoles.find(({ name, global }) => (name === 'admin' && global));
        if (!hasGlobalAdmin) return next(Boom.forbidden());

        const { type, id } = req.body;
        if (!type || !id) return next(Boom.badRequest());
        if ((Object.keys(deletedTypeLookup).indexOf(type) === -1)) return next(Boom.badRequest());

        await deletedTypeLookup[type].restore(id);

        return res.status(204).send();
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
