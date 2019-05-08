import systemic from 'systemic';
import broadcast from './broadcast';

export default () => systemic({ name: 'broadcast '})
  .add('broadcast', broadcast()).dependsOn('config', 'logger');
