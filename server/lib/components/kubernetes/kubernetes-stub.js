import yaml from 'js-yaml';
import hogan from 'hogan.js';

export default function(options = {}) {

  function start({ repo = {}, }, cb) {

    function apply(image, source, cb) {
      try {
        const template = hogan.compile(source);
        repo[image] = yaml.safeLoadAll(template.render({ image, }));
      } catch(err) {
        return cb(err);
      }
      cb();
    }

    return cb(null, {
      apply,
    });
  }

  return {
    start,
  };
}
