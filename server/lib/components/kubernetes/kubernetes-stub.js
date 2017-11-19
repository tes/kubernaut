import { safeLoadAll, } from 'js-yaml';

export default function(options = {}) {

  const defautContexts = {
    test: {
      manifests: [],
    },
  };

  function start({ contexts = defautContexts, }, cb) {

    function apply(context, manifest) {
      return new Promise((resolve, reject) => {
        if (!contexts[context]) return reject(new Error(`Unknown context: ${context}`));
        contexts[context].manifests.push(safeLoadAll(manifest));
        resolve();
      });
    }

    function checkContext(context) {
      return new Promise((resolve) => {
        resolve(Object.keys(contexts).includes[context]);
      });
    }

    return cb(null, {
      apply,
      checkContext,
    });
  }

  return {
    start,
  };
}
