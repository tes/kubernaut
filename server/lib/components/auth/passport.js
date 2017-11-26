import passport from 'passport';

export default function() {

  function start({ config, }, cb) {

    passport.serializeUser((user, cb) => {
      cb(null, user);
    });

    passport.deserializeUser((obj, cb) => {
      cb(null, obj);
    });

    cb(null, passport);
  }

  return {
    start,
  };
}
