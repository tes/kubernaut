import { Strategy as CustomStrategy } from 'passport-custom';

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
*/
module.exports = function() {

  function start({ logger, app, passport, store }, cb) {

    logger.info('Initialising local authentication strategy');

    const strategy = new CustomStrategy(async (req, cb) => {
      try {
        const profile = { displayName: 'Bob Holness' };
        const identity = { name: 'blockbusters', provider: 'kubernaut', 'type': 'local' };
        const meta = { date: new Date(), account: { id: '00000000-0000-0000-0000-000000000000' } };
        const account = await store.ensureAccount(profile, identity, meta);
        cb(null, account);
      } catch (err) {
        cb(err);
      }
    });

    strategy.name = 'local';

    passport.use(strategy);

    cb(null, { name: strategy.name, app: true, api: true });
  }

  return {
    start,
  };
};
