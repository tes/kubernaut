import { userInfo, } from 'os';
import { Strategy as CustomStrategy, } from 'passport-custom';

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
*/
module.exports = function() {

  function start({ logger, app, passport, }, cb) {

    logger.info('Using local authentication strategy');

    const strategy = new CustomStrategy((req, cb) => {
      return cb(null, { id: userInfo().username, });
    });

    strategy.name = 'local';

    passport.use(strategy);

    app.get('/auth/local', passport.authenticate('local'), (req, res) => {
      res.locals.logger.info(`Authenticated ${req.user.id} using local strategy`);
      res.redirect(req.session.returnTo || '/');
    });

    cb();
  }

  return {
    start,
  };
};
