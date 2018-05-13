import systemic from 'systemic';
import confabulous from './confabulous';

export default () => systemic({ name: 'config' })
  .add('config.overrides', {})
  .add('config', confabulous(), { scoped: true }).dependsOn({ component: 'config.overrides', destination: 'overrides' });

