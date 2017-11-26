import System from 'systemic';
import strategyFactory from './strategy-factory';
import passport from './passport';
import middleware from './middleware';

module.exports = new System({ name: 'auth', })
  .add('passport', passport()).dependsOn('config', 'logger')
  .add('auth.strategies', strategyFactory()).dependsOn('config', 'logger', 'app', 'session', 'passport', 'logger.middleware')
  .add('auth.middleware', middleware()).dependsOn('config', 'logger', 'app', 'logger.middleware', 'auth.strategies');
