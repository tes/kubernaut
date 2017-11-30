import System from 'systemic';
import system from './system';
import releases from './releases';
import deployments from './deployments';
import app from './app';

module.exports = new System({ name: 'routes', })
  .add('routes.system', system()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'pkg')
  .add('routes.releases', releases()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'store', 'checksum')
  .add('routes.deployments', deployments()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, 'store', 'kubernetes')
  .add('routes.app', app()).dependsOn('config', 'logger', 'app', { component: 'logger.middleware', destination: 'loggerMiddleware', }, { component: 'auth.middleware', destination: 'auth', })
  .add('routes').dependsOn('routes.system', 'routes.releases', 'routes.deployments', 'routes.app');
