const { resolve } = require('path');
import system from '../server/lib/system';
import {
  makeRootMeta,
  makeCluster,
  makeNamespace,
  makeRelease,
  makeService,
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

    await (async () => {
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

    const services = [];
    while (services.length < 6) {
      services.push(makeService());
    }
    const releases = [];
    services.forEach(service => {
      for (let i = 0; i < 20; i++) {
        releases.push(makeRelease({ service }));
      }
    });

    await Promise.all(
      releases.map(release =>
        store.saveRelease(release, makeRootMeta({ date: new Date() })).catch(() => {})
      )
    );

    process.exit(0);
  })();
} catch (e) {
  console.error('Ouch', e); // eslint-disable-line no-console
  process.exit(1);
}
