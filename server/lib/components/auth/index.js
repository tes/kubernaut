import System from 'systemic';
import strategyFactory from './strategy-factory';
import passport from './passport';

module.exports = new System({ name: 'auth', })
  .add('passport', passport()).dependsOn('config', 'logger')
  .add('auth', strategyFactory()).dependsOn('config', 'logger', 'app', 'session', 'passport', 'logger.middleware', 'store');
