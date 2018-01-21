import System from 'systemic';
import account from './account';
import registry from './registry';
import release from './release';
import cluster from './cluster';
import namespace from './namespace';
import deployment from './deployment';
import store from './store';

module.exports = new System({ name: 'stores/memory', })
  .add('tables', { account_roles: [], identities: [], accounts: [], registries: [], services: [], releases: [], clusters: [], namespaces: [], deployments: [], deploymentLogEntries: [], })
  .add('store.account', account()).dependsOn(
    'config',
    'logger',
    'tables',
    { component: 'store.registry', destination: 'registries', },
    { component: 'store.namespace', destination: 'namespaces', }
  )
  .add('store.registry', registry()).dependsOn('config', 'logger', 'tables')
  .add('store.release', release()).dependsOn(
    'config',
    'logger',
    'tables',
    { component: 'store.registry', destination: 'registries', },
   )
  .add('store.cluster', cluster()).dependsOn('config', 'logger', 'tables')
  .add('store.namespace', namespace()).dependsOn('config', 'logger', 'tables')
  .add('store.deployment', deployment()).dependsOn('config', 'logger', 'tables', { component: 'store.release', destination: 'releases', },)
  .add('store', store()).dependsOn(
    'tables',
    { component: 'store.account', destination: 'accounts', },
    { component: 'store.registry', destination: 'registries', },
    { component: 'store.release', destination: 'releases', },
    { component: 'store.cluster', destination: 'clusters', },
    { component: 'store.namespace', destination: 'namespaces', },
    { component: 'store.deployment', destination: 'deployments', },
  );
