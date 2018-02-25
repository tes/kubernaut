const session = require('express-session');
const PostgresStore = require('connect-pg-simple')(session);

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
 */
module.exports = function() {

  function start({ config, logger, postgres, }, cb) {

    logger.info('Using PostgreSQL backed sessions');

    const store = new PostgresStore({
      pool: postgres,
      errorLog: logger,
    });

    store.on('error', err => {
      logger.error('Error from session store', err);
    });

    cb(null, session({
      ...config,
      store,
    }));
  }

  return {
    start,
  };
};
