import { Strategy as BearerStrategy } from 'passport-http-bearer';

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
*/
module.exports = function() {

  function start({ config, logger, app, passport, store, cryptus }, cb) {

    logger.info('Initialising bearer token authentication strategy');

    const strategy = new BearerStrategy(async (token, cb) => {
      try {
        const encrypted = Buffer.from(token, 'base64').toString();
        const name = await cryptus.decrypt(config.key, encrypted);
        const identity = { name, provider: 'kubernaut', 'type': 'bearer' };
        const account = await store.findAccount(identity);
        cb(null, account);
      } catch (err) {
        cb(err);
      }
    });

    passport.use(strategy);

    cb(null, { name: strategy.name, app: false, api: true });
  }

  return {
    start,
  };
};
