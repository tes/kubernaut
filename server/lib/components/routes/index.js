import System from 'systemic';
import system from './system';
import registries from './registries';
import namespaces from './namespaces';
import accounts from './accounts';
import releases from './releases';
import deployments from './deployments';
import app from './app';

module.exports = new System({ name: 'routes', })
  .add('routes.system', system()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'pkg')
  .add('routes.registries', registries()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'store', 'auth')
  .add('routes.namespaces', namespaces()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'store', 'auth')
  .add('routes.accounts', accounts()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'store', 'auth')
  .add('routes.releases', releases()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'store', 'checksum', 'kubernetes', 'auth')
  .add('routes.deployments', deployments()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'store', 'kubernetes', 'auth')
  .add('routes.app', app()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'auth', 'passport')
  .add('routes').dependsOn('routes.system', 'routes.registries', 'routes.namespaces', 'routes.accounts', 'routes.releases', 'routes.deployments', 'routes.app');
