import passport from 'passport';
import Account from '../../domain/Account';

export default function() {

  function start({ config }, cb) {

    passport.serializeUser((account, cb) => {
      cb(null, account);
    });

    passport.deserializeUser((account, cb) => {
      cb(null, new Account({ ...account }));
    });

    cb(null, passport);
  }

  return {
    start,
  };
}
