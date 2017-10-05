import System from 'systemic';
import kubernetes from './kubernetes-stub';

module.exports = new System({ name: 'kubernetes', })
  .add('kubernetes', kubernetes());

