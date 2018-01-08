import System from 'systemic';
import kubernetes from './kubernetes-cli';

module.exports = new System({ name: 'kubernetes', })
  .add('kubernetes', kubernetes()).dependsOn('store');

