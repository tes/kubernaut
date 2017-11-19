import System from 'systemic';
import admin from './admin';
import releases from './releases';
import deployments from './deployments';
import app from './app';

module.exports = new System({ name: 'routes', })
  .add('routes.admin', admin()).dependsOn('config', 'logger', 'app', { component: 'middleware.prepper', destination: 'prepper', }, 'pkg')
  .add('routes.releases', releases()).dependsOn('config', 'logger', 'app', { component: 'middleware.prepper', destination: 'prepper', }, 'store', 'checksum')
  .add('routes.deployments', deployments()).dependsOn('config', 'logger', 'app', { component: 'middleware.prepper', destination: 'prepper', }, 'store', 'kubernetes')
  .add('routes.app', app()).dependsOn('config', 'logger', 'app', { component: 'middleware.prepper', destination: 'prepper', })
  .add('routes').dependsOn('routes.admin', 'routes.releases', 'routes.deployments', 'routes.app');
