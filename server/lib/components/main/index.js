import System from 'systemic';
import path from 'path';

const pkg = require(path.join(process.cwd(), 'package.json'));

module.exports = new System({ name: 'main', })
  .add('pkg', pkg);

