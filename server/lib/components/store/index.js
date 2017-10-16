import System from 'systemic';
import postgres from 'systemic-pg';
import migrator from './migrator';
import store from './real';

module.exports = new System({ name: 'store', })
  .add('migrator', migrator()).dependsOn({ component: 'config', source: 'postgres', destination: 'config.postgres', })
  .add('postgres', postgres()).dependsOn('config', 'logger', 'migrator')
  .add('store', store()).dependsOn('config', 'logger', 'postgres');
