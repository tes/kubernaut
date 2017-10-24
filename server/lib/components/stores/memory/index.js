import System from 'systemic';
import release from './release';
import store from './store';

module.exports = new System({ name: 'stores/memory', })
  .add('tables', { releases: [], services: [], })
  .add('store.release', release()).dependsOn('config', 'logger', 'tables')
  .add('store', store()).dependsOn(
    'tables',
    { component: 'store.release', destination: 'release', },
  );
