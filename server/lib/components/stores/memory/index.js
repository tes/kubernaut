import System from 'systemic';
import release from './release';
import deployment from './deployment';
import store from './store';

module.exports = new System({ name: 'stores/memory', })
  .add('tables', { releases: [], services: [], deployments: [], })
  .add('store.release', release()).dependsOn('config', 'logger', 'tables')
  .add('store.deployment', deployment()).dependsOn('config', 'logger', 'tables')
  .add('store', store()).dependsOn(
    'tables',
    { component: 'store.release', destination: 'release', },
    { component: 'store.deployment', destination: 'deployment', },
  );
