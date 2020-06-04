import Boom from 'boom';

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

    cb();
  }

  return {
    start,
  };
}
