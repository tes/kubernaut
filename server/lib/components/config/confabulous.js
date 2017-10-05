import path from 'path';
import Confabulous from 'confabulous';

const loaders = Confabulous.loaders;

export default function(options = {}) {

  let config;

  function start({ overrides, }, cb) {
    if (config) return cb(null, config);
    new Confabulous()
      .add(config => loaders.require({ path: path.join(process.cwd(), 'server', 'config', 'default.js'), watch: true, }))
      .add(config => loaders.require({ path: path.join(process.cwd(), 'server', 'config', `${process.env.APP_ENV}.js`), mandatory: false, }))
      .add(config => loaders.require({ path: path.join(process.cwd(), 'secrets', 'secrets.json'), watch: true, mandatory: false, }))
      .add(config => loaders.args())
      .add(config => loaders.echo(overrides))
      .on('loaded', cb)
      .on('error', cb)
      .end(cb);
  }

  return {
    start,
  };
}
