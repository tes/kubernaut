import System from 'systemic';
import multiTenant from './multi-tenant';
import migrator from './migrator';
import postgres from 'systemic-pg';
import release from './release';
import deployment from './deployment';
import store from './store';

module.exports = new System({ name: 'stores/postgres', })
  .add('multiTenant', multiTenant()).dependsOn({ component: 'config', source: 'postgres', destination: 'config', }, 'logger' )
  .add('migrator', migrator()).dependsOn({ component: 'multiTenant', destination: 'config', }, )
  .add('postgres', postgres()).dependsOn({ component: 'multiTenant', destination: 'config', }, 'logger', 'migrator')
  .add('store.release', release()).dependsOn('config', 'logger', 'postgres')
  .add('store.deployment', deployment()).dependsOn('config', 'logger', 'postgres')
  .add('store', store()).dependsOn(
    'config',
    'logger',
    'postgres',
    { component: 'store.release', destination: 'release', },
    { component: 'store.deployment', destination: 'deployment', },
  );

