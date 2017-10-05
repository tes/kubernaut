import System from 'systemic';
import confabulous from './confabulous';

module.exports = new System({ name: 'config', })
  .add('config.overrides', {})
  .add('config', confabulous(), { scoped: true, }).dependsOn({ component: 'config.overrides', destination: 'overrides', });

