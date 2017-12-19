import System from 'systemic';
import account from './account';
import release from './release';
import deployment from './deployment';
import store from './store';

module.exports = new System({ name: 'stores/memory', })
  .add('tables', { account_roles: [], identities: [], accounts: [], namespaces: [], services: [], releases: [], deployments: [], })
  .add('store.account', account()).dependsOn('config', 'logger', 'tables')
  .add('store.release', release()).dependsOn('config', 'logger', 'tables')
  .add('store.deployment', deployment()).dependsOn('config', 'logger', 'tables')
  .add('store', store()).dependsOn(
    'tables',
    { component: 'store.account', destination: 'account', },
    { component: 'store.release', destination: 'release', },
    { component: 'store.deployment', destination: 'deployment', },
  );
