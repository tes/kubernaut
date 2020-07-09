const { resolve } = require('path');
import Promise from 'bluebird';
import system from '../server/lib/system';
import {
  makeRootMeta,
  makeCluster,
  makeNamespace,
  makeRelease,
  makeService,
  makeDeployment,
  makeRegistry,
  makeTeam,
} from '../server/test/factories';
process.env.APP_ENV = process.env.APP_ENV || 'local';
try {
  console.error('>>> Checking/creating local env data. This might take a few minutes.'); // eslint-disable-line no-console
  (async () => {
    const scriptSystem = system()
      .set('config.overrides', { transports: { human: { level: 'error' } } })
      .remove('server');
    const { store } = await scriptSystem.start();

    const ensureRegistry = async (name) => {
      const existingRegistry = await store.findRegistry({ name });
      if (existingRegistry) return existingRegistry;

      return await store.saveRegistry(makeRegistry({
        name,
      }), makeRootMeta({ date: new Date() }));
    };

    const ensureCluster = async (name, color = 'saddlebrown', priority, config = resolve(process.env.HOME, '.kube/config'), context = 'docker-for-desktop') => {
      const existingCluster = await store.findCluster({ name });
      if (existingCluster) return existingCluster;

      return await store.saveCluster(makeCluster({
        name,
        config,
        color,
        priority,
        context,
      }), makeRootMeta({ date: new Date() }));
    };
    const ensureNamespace = async (name, cluster) => {
      const existing = await store.findNamespace({ name, cluster: cluster.name });
      if (existing) return existing;

      return await store.saveNamespace(makeNamespace({
        name,
        cluster: cluster,
      }), makeRootMeta({ date: new Date() }));
    };

    const registry = await ensureRegistry('default');
    const secondRegistry = await ensureRegistry('second-registry');

    const cluster = await ensureCluster('development', 'saddlebrown', 100);
    const stagingCluster = await ensureCluster('staging', 'blue', 200);
    const liveCluster = await ensureCluster('live', 'goldenrod', 300);
    const localCluster = await ensureCluster('local', 'lightblue', 100, resolve(process.env.HOME, '.config/k3d/k3s-default/kubeconfig.yaml'), 'k3s-default');

    await ensureNamespace('default', localCluster);
    const defaultNS = await ensureNamespace('default', cluster);
    const privateNS = await ensureNamespace('private', cluster);
    const defaultNSOnStagingCluster = await ensureNamespace('default', stagingCluster);
    const privateNSOnStagingCluster = await ensureNamespace('private', stagingCluster);
    const defaultNSOnliveCluster = await ensureNamespace('default', liveCluster);
    const privateNSOnliveCluster = await ensureNamespace('private', liveCluster);

    const numberOfServices = 100;

    const services = await (async () => {
      const existing = await store.findServices();
      if (existing.count) return existing.items;

      const newServices = [];
      while (newServices.length < numberOfServices) {
        if (newServices.length >= 80)
          newServices.push(makeService({ registry: secondRegistry }));
        else newServices.push(makeService({ registry }));
      }
      return newServices;
    })();

    const numberOfTeams = 10;
    const teams = await (async () => {
      const existing = await store.findTeams();
      if (existing.count) return existing.items;

      const newTeams = [];
      while(newTeams.length < numberOfTeams) {
        try {
          const newId = await store.saveTeam(makeTeam(), makeRootMeta());
          newTeams.push(await store.getTeam(newId));
        } catch (e) {
          if (e.code !== '23505') throw e; // only throw when its not a unique violation
        }
      }

      return newTeams;
    })();

    const releasesPerService = 20;
    await (async () => {
      const existing = await store.findReleases({}, 20, 0, 'created', 'asc');
      if (existing.count) return;

      const newReleases = [];
      services.forEach(service => {
        const base = Math.floor(Math.random() * 100);
        for (let i = 0; i < releasesPerService; i++) {
          newReleases.push(makeRelease({ service, version: base + i, attributes: { image: 'agabert/beacon', port: 80, probe: '/beacon/health' } }));
        }
      });

      await Promise.map(newReleases, async release => {
        const savedRelease = await store.saveRelease(release, makeRootMeta());
        const index = services.findIndex(service => service.name === savedRelease.service.name && service.registry.id === savedRelease.service.registry.id);
        services[index].id = savedRelease.service.id;
      },
        { concurrency: 1 }
      );
    })();

    await (async () => {
      for (const service of services) {
        if (await store.getTeamForService(service)) continue;

        const team = teams[Math.floor(Math.random() * teams.length)];
        await store.associateServiceWithTeam(service, team);
      }
    })();

    await (async () => {
      const existing = await store.findDeployments({}, 10, 0);
      if (existing.count) return;

      await Promise.map(services, async service => {
        const ns = Math.random() > 0.5 ? [defaultNS, defaultNSOnStagingCluster, defaultNSOnliveCluster] : [privateNS, privateNSOnStagingCluster, privateNSOnliveCluster];
        const releases = await store.findReleases({ service: service.name, registries: [service.registry.id]}, releasesPerService, 0, 'created', 'asc');
        return await Promise.map(releases.items, async (releaseThin, index, length) => {
          try {
            const release = await store.getRelease(releaseThin.id);
            await store.saveDeployment(makeDeployment({
              namespace: ns[0],
              release,
            }), makeRootMeta({ date: release.createdOn }));

            await store.saveDeployment(makeDeployment({
              namespace: ns[1],
              release,
            }), makeRootMeta({ date: new Date(release.createdOn.getTime() + 1) }));

            if (index === length - 2) await store.saveDeployment(makeDeployment({
              namespace: ns[2],
              release,
            }), makeRootMeta({ date: new Date(release.createdOn.getTime() + 1) }));
          } catch (e) {}
        }, { concurrency: 1});
      },
        { concurrency: 1 }
      );
    })();

    console.error('>>> Local env data setup completed.'); // eslint-disable-line no-console
    process.exit(0);
  })();
} catch (e) {
  console.error('Ouch', e); // eslint-disable-line no-console
  process.exit(1);
}
