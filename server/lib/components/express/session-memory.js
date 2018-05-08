const session = require('express-session');

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
*/
module.exports = function() {

  function start({ config, logger }, cb) {

    logger.info('Using Memory backed sessions');

    cb(null, session(config));
  }

  return {
    start,
  };
};
