import { Strategy as CustomStrategy, } from 'passport-custom';

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
*/
module.exports = function() {

  function start({ logger, app, passport, }, cb) {

    logger.info('Using test authentication strategy');

    const strategy = new CustomStrategy((req, cb) => {
      const user = { id: 'chuck', };
      return cb(null, user);
    });

    strategy.name = 'test';

    passport.use(strategy);

    app.get('/auth/test', passport.authenticate('test'), (req, res) => {
      res.locals.logger.info(`Authenticated ${req.user.id} using test strategy`);
      res.redirect(req.session.returnTo || '/');
    });

    app.locals.loginUrl = '/auth/test';

    cb();
  }

  return {
    start,
  };
};
