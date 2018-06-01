import systemic from 'systemic';
import strategyFactory from './strategy-factory';
import passport from './passport';
import cryptus from './cryptus';

export default () => systemic({ name: 'auth' })
  .add('cryptus', cryptus())
  .add('passport', passport()).dependsOn('config', 'logger', 'store')
  .add('auth', strategyFactory()).dependsOn('config', 'logger', 'app', 'session', 'passport', 'logger.middleware', 'store', 'cryptus');
