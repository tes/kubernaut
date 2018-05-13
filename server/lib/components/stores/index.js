import systemic from 'systemic';
import postgres from './postgres';

export default () => systemic({ name: 'stores' })
  .include(postgres);

