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
} from '../server/test/factories';
process.env.APP_ENV = process.env.APP_ENV || 'local';
try {
  (async () => {
    const scriptSystem = system()
      // .set('kubernetes', kubernetes()).dependsOn('config', 'logger')
      .remove('server');
    const { store } = await scriptSystem.start();

    const ensureRegistry = async (name) => {
      const existingRegistry = await store.findRegistry({ name });
      if (existingRegistry) return existingRegistry;

      return await store.saveRegistry(makeRegistry({
        name,
      }), makeRootMeta({ date: new Date() }));
    };

    const ensureCluster = async (name, color = 'saddlebrown') => {
      const existingCluster = await store.findCluster({ name });
      if (existingCluster) return existingCluster;

      return await store.saveCluster(makeCluster({
        name,
        config: resolve(process.env.HOME, '.kube/config'),
        color,
      }), makeRootMeta({ date: new Date() }));
    };
    const ensureNamespace = async (name, cluster) => {
      const existing = await store.findNamespace({ name, cluster: cluster.name });
      if (existing) return existing;

      return await store.saveNamespace(makeNamespace({
        name,
        cluster: cluster,
        context: 'docker-for-desktop',
      }), makeRootMeta({ date: new Date() }));
    };

    const registry = await ensureRegistry('default');
    const secondRegistry = await ensureRegistry('second-registry');

    const cluster = await ensureCluster('development');
    const stagingCluster = await ensureCluster('staging', 'blue');
    const liveCluster = await ensureCluster('live', 'goldenrod');

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

    const releasesPerService = 20;
    await (async () => {
      const existing = await store.findReleases({}, 20, 0, 'created', 'asc');
      if (existing.count) return;

      const newReleases = [];
      services.forEach(service => {
        const base = Math.floor(Math.random() * 100);
        for (let i = 0; i < releasesPerService; i++) {
          newReleases.push(makeRelease({ service, version: base + i }));
        }
      });

      await Promise.map(newReleases, release =>
        store.saveRelease(release, makeRootMeta()).catch(() => {}),
        { concurrency: 1 }
      );
    })();

    await (async () => {
      const existing = await store.findDeployments({}, 10, 0);
      if (existing.count) return;

      await Promise.map(services, async service => {
        const ns = Math.random() > 0.5 ? [defaultNS, defaultNSOnStagingCluster, defaultNSOnliveCluster] : [privateNS, privateNSOnStagingCluster, privateNSOnliveCluster];
        const releases = await store.findReleases({ service: service.name, registries: [service.registry.id]}, releasesPerService, 0, 'created', 'asc');
        return await Promise.map(releases.items, (release, index, length) => {
          return store.saveDeployment(makeDeployment({
            namespace: ns[0],
            release,
          }), makeRootMeta({ date: release.createdOn }))
          .then(() => store.saveDeployment(makeDeployment({
            namespace: ns[1],
            release,
          }), makeRootMeta({ date: new Date(release.createdOn.getTime() + 1) })))
          .then(() => {
            if (index === length - 2) return store.saveDeployment(makeDeployment({
              namespace: ns[2],
              release,
            }), makeRootMeta({ date: new Date(release.createdOn.getTime() + 1) }));
          })
          .catch(() => {});
        }, { concurrency: 1});
      },
        { concurrency: 1 }
      );
    })();

    process.exit(0);
  })();
} catch (e) {
  console.error('Ouch', e); // eslint-disable-line no-console
  process.exit(1);
}
