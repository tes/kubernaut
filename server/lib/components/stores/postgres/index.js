import System from 'systemic';
import migrator from './migrator';
import postgres from 'systemic-pg';
import release from './release';
import store from './store';

module.exports = new System({ name: 'stores/postgres', })
  .add('migrator', migrator()).dependsOn({ component: 'config', source: 'postgres', destination: 'config.postgres', })
  .add('postgres', postgres()).dependsOn('config', 'logger', 'migrator')
  .add('store.release', release()).dependsOn('config', 'logger', 'postgres')
  .add('store', store()).dependsOn(
    'config',
    'logger',
    'postgres',
    { component: 'store.release', destination: 'release', },
  );

