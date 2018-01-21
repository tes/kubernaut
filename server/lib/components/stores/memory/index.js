import System from 'systemic';
import registry from './registry';
import namespace from './namespace';
import account from './account';
import release from './release';
import deployment from './deployment';
import store from './store';

module.exports = new System({ name: 'stores/memory', })
  .add('tables', { account_roles: [], identities: [], accounts: [], registries: [], namespaces: [], services: [], releases: [], deployments: [], deploymentLogEntries: [], })
  .add('store.registry', registry()).dependsOn('config', 'logger', 'tables')
  .add('store.namespace', namespace()).dependsOn('config', 'logger', 'tables')
  .add('store.account', account()).dependsOn('config', 'logger', 'tables', { component: 'store.namespace', destination: 'namespaces', })
  .add('store.release', release()).dependsOn('config', 'logger', 'tables', { component: 'store.namespace', destination: 'namespaces', }, )
  .add('store.deployment', deployment()).dependsOn('config', 'logger', 'tables', { component: 'store.release', destination: 'releases', },)
  .add('store', store()).dependsOn(
    'tables',
    { component: 'store.registry', destination: 'registries', },
    { component: 'store.namespace', destination: 'namespaces', },
    { component: 'store.account', destination: 'accounts', },
    { component: 'store.release', destination: 'releases', },
    { component: 'store.deployment', destination: 'deployments', },
  );
