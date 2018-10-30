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
    const secondCluster = await ensureCluster('staging', 'blue');

    const defaultNS = await ensureNamespace('default', cluster);
    const anotherNS = await ensureNamespace('another', cluster);
    const defaultNSOnSecondCluster = await ensureNamespace('default', secondCluster);
    const anotherNSOnSecondCluster = await ensureNamespace('another', secondCluster);

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

    const releases = await (async () => {
      const releasesPerService = 20;
      const existing = await store.findReleases({}, services.length * releasesPerService, 0, 'created', 'asc');
      if (existing.count) return existing.items;

      const newReleases = [];
      services.forEach(service => {
        for (let i = 0; i < releasesPerService; i++) {
          newReleases.push(makeRelease({ service }));
        }
      });

      await Promise.map(newReleases, release =>
        store.saveRelease(release, makeRootMeta()).catch(() => {}),
        { concurrency: 1 }
      );

      return (await store.findReleases({}, services.length * releasesPerService, 0, 'created', 'asc')).items;
    })();

    await (async () => {
      const existing = await store.findDeployments({}, 10, 0);
      if (existing.count) return;

      await Promise.map(releases, release => {
        const ns = Math.random() > 0.5 ? [defaultNS, defaultNSOnSecondCluster] : [anotherNS, anotherNSOnSecondCluster];
        return store.saveDeployment(makeDeployment({
          namespace: ns[0],
          release,
        }), makeRootMeta({ date: release.createdOn }))
        .then(() => store.saveDeployment(makeDeployment({
          namespace: ns[1],
          release,
        }), makeRootMeta({ date: new Date(release.createdOn.getTime() + 1) })))
        .catch(() => {});
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
