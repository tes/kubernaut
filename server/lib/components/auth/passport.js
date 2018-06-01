import passport from 'passport';

export default function() {

  function start({ config, store, logger }, cb) {

    passport.serializeUser((account, cb) => {
      cb(null, account);
    });

    passport.deserializeUser(async (account, cb) => {
      try {
        const storeAccount = await store.getAccount(account.id);
        cb(null, storeAccount);
      } catch (err) {
        logger.error(`Error deserializing user ${account.id} - ${account.displayName}`, err);
        cb(err);
      }
    });

    cb(null, passport);
  }

  return {
    start,
  };
}
