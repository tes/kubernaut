import System from 'systemic';
import admin from './admin';

module.exports = new System({ name: 'routes', })
  .add('routes.admin', admin()).dependsOn('config', 'logger', 'app', { component: 'middleware.prepper', destination: 'prepper', }, 'pkg')
  .add('routes').dependsOn('routes.admin');
