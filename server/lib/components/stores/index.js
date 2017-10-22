import System from 'systemic';
import postgres from './postgres';

module.exports = new System({ name: 'stores', })
  .include(postgres);

