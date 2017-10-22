import System from 'systemic';
import profile from './profile';
import release from './release';
import store from './store';

module.exports = new System({ name: 'stores/memory', })
  .add('tables', { profiles: [], releases: [], services: [], })
  .add('store.profile', profile()).dependsOn('config', 'logger', 'tables')
  .add('store.release', release()).dependsOn('config', 'logger', 'tables')
  .add('store', store()).dependsOn(
    'tables',
    { component: 'store.profile', destination: 'profile', },
    { component: 'store.release', destination: 'release', },
  );
