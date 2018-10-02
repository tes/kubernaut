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
} from '../server/test/factories';
process.env.APP_ENV = process.env.APP_ENV || 'local';
try {
  (async () => {
    const scriptSystem = system()
      // .set('kubernetes', kubernetes()).dependsOn('config', 'logger')
      .remove('server');
    const { store } = await scriptSystem.start();

    const cluster = await (async () => {
      const existingCluster = await store.findCluster({ name: 'local' });
      if (existingCluster) return existingCluster;

      return await store.saveCluster(makeCluster({
        name: 'local',
        config: resolve(process.env.HOME, '.kube/config'),
        color: 'saddlebrown',
      }), makeRootMeta({ date: new Date() }));
    })();

    const defaultNS = await (async () => {
      const existing = await store.findNamespace({ name: 'default', cluster: cluster.name });
      if (existing) return existing;

      return await store.saveNamespace(makeNamespace({
        name: 'default',
        cluster: cluster,
        context: 'docker-for-desktop',
      }), makeRootMeta({ date: new Date() }));
    })();

    await (async () => {
      const existing = await store.findNamespace({ name: 'another', cluster: cluster.name });
      if (existing) return existing;

      return await store.saveNamespace(makeNamespace({
        name: 'another',
        cluster: cluster,
        context: 'docker-for-desktop',
      }), makeRootMeta({ date: new Date() }));
    })();

    const services = await (async () => {
      const existing = await store.findServices();
      if (existing.count) return existing.items;

      const newServices = [];
      while (newServices.length < 100) {
        newServices.push(makeService());
      }
      return newServices;
    })();

    const releases = await (async () => {
      const existing = await store.findReleases({}, 200, 0);
      if (existing.count) return existing.items;

      const newReleases = [];
      const releasesPerService = 20;
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
      const existing = await store.findDeployments({}, 200, 0);
      if (existing.count) return;

      await Promise.map(releases, release =>
        store.saveDeployment(makeDeployment({
          namespace: defaultNS,
          release,
        }), makeRootMeta({ date: release.createdOn })).catch(() => {}),
        { concurrency: 1 }
      );
    })();

    process.exit(0);
  })();
} catch (e) {
  console.error('Ouch', e); // eslint-disable-line no-console
  process.exit(1);
}
