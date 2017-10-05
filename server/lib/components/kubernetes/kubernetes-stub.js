export default function(options = {}) {

  function start({ repo = {}, }, cb) {

    function apply(image, manifest) {
      return new Promise((resolve) => {
        repo[image] = manifest;
        resolve();
      })
    }

    return cb(null, {
      apply,
    });
  }

  return {
    start,
  };
}
