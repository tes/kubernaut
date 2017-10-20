import System from 'systemic';
import path from 'path';
import { real, } from 'groundhog-day';

const pkg = require(path.join(process.cwd(), 'package.json'));

module.exports = new System({ name: 'main', })
  .add('pkg', pkg)
  .add('clock', real());

