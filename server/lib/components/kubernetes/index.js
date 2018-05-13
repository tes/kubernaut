import systemic from 'systemic';
import kubernetes from './kubernetes-cli';

export default () => systemic({ name: 'kubernetes' })
  .add('kubernetes', kubernetes());

