import highwayhash from 'highwayhash';

module.exports = function(options = {}) {

  function start({ config }, cb) {

    const key = Buffer.from(config.key, 'hex');

    cb(null, function(buffer) {
      return highwayhash.asHexString(key, buffer);
    });
  }

  return {
    start: start,
  };
};
