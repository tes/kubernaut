import { Strategy as BearerStrategy, } from 'passport-http-bearer';

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
*/
module.exports = function() {

  function start({ config, logger, app, passport, }, cb) {

    logger.info('Using bearer authentication strategy');

    const strategy = new BearerStrategy((token, cb) => {
      const user = config.users.find(u => u.token === token);
      if (!user) return cb(null, false);
      return cb(null, user, { scope: 'all', });
    });

    const authenticate = (req, res, next) => {
      passport.authenticate('token', (err, user, info) => {
        if (err) return next(err);
        if (!user) return next();
        req.logIn(user, { session: false, }, err => {
          if (err) return next(err);
          res.locals.logger.info(`Authenticated ${req.user.id} using bearer strategy`);
          next();
        });
      })(req, res, next);
    };

    strategy.name = 'token';

    passport.use(strategy);

    app.use(authenticate);

    cb();
  }

  return {
    start,
  };
};
