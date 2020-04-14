import systemic from 'systemic';
import migrator from './migrator';
import postgres from 'systemic-pg';
import db from './db';
import registry from './registry';
import cluster from './cluster';
import namespace from './namespace';
import account from './account';
import release from './release';
import deployment from './deployment';
import job from './job';
import service from './service';
import secret from './secret';
import audit from './audit';
import team from './team';
import authz from './authz';
import store from './store';

const authzDep = { component: 'store.authz', destination: 'authz' };

export default () => systemic({ name: 'stores/postgres' })
  .add('migrator', migrator()).dependsOn({ component: 'config', source: 'postgres', destination: 'config' }, )
  .add('postgres', postgres()).dependsOn('config', 'logger', 'migrator')
  .add('db', db()).dependsOn('config', 'logger', 'postgres')
  .add('store.authz', authz).dependsOn('config', 'logger', 'db')
  .add('store.registry', registry()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.cluster', cluster()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.namespace', namespace()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.account', account()).dependsOn('config', { component: 'config', source: 'auth', destination: 'authConfig' }, 'logger', 'db', authzDep)
  .add('store.release', release()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.deployment', deployment()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.job', job()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.service', service()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.secret', secret()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.team', team()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store.audit', audit()).dependsOn('config', 'logger', 'db', authzDep)
  .add('store', store()).dependsOn(
    'config', 'logger', 'db',
    { component: 'store.registry', destination: 'registry' },
    { component: 'store.cluster', destination: 'cluster' },
    { component: 'store.namespace', destination: 'namespace' },
    { component: 'store.account', destination: 'account' },
    { component: 'store.release', destination: 'release' },
    { component: 'store.deployment', destination: 'deployment' },
    { component: 'store.service', destination: 'service' },
    { component: 'store.secret', destination: 'secret' },
    { component: 'store.team', destination: 'team' },
    { component: 'store.audit', destination: 'audit' },
    { component: 'store.job', destination: 'job' },
  );
