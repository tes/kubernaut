import System from 'systemic';
import prepper from './prepper';
import human from './human';
import bunyan from './bunyan';
import prepperMiddleware from './prepper-middleware';

module.exports = new System({ name: 'logging', })
  .add('transports.human', human())
  .add('transports.bunyan', bunyan()).dependsOn('pkg')
  .add('transports').dependsOn(
    { component: 'transports.human', destination: 'human', },
    { component: 'transports.bunyan', destination: 'bunyan', })
  .add('logger', prepper()).dependsOn('config', 'pkg', 'transports')
  .add('middleware.prepper', prepperMiddleware()).dependsOn('app');

