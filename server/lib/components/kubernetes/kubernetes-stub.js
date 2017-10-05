import { safeLoadAll, } from 'js-yaml';

export default function(options = {}) {

  function start({ store = [],}, cb) {

    function apply(yaml) {
      return new Promise((resolve) => {
        store.push(safeLoadAll(yaml));
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
