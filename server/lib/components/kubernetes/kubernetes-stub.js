import { safeLoadAll, } from 'js-yaml';

export default function(options = {}) {

  function start({ manifests = [],}, cb) {

    function apply(yaml) {
      return new Promise((resolve) => {
        manifests.push(safeLoadAll(yaml));
        resolve();
      });
    }

    return cb(null, {
      apply,
    });
  }

  return {
    start,
  };
}
