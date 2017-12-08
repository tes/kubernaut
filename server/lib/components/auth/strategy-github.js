import { Strategy as GitHubStrategy, } from 'passport-github';

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
*/
module.exports = function() {

  function start({ config, logger, app, passport, store, }, cb) {

    logger.info('Using github authentication strategy');

    const strategy = new GitHubStrategy({
      clientID: config.client.id,
      clientSecret: config.client.secret,
      passReqToCallback: true,
    }, async (req, accessToken, refreshToken, profile, cb) => {
      try {
        const profile = { displayName: profile.username, };
        const identity = { name: profile.username, provider: 'github', 'type': 'OAuth', };
        const meta = { date: new Date(), user: 'root', };
        const account = await store.ensureAccount(profile, identity, meta);
        cb(null, account);
      } catch (err) {
        cb(err);
      }
    });

    passport.use(strategy);

    app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/', }), (req, res) => {
      res.locals.logger.info(`Authenticated ${req.user.id} using github strategy`);
      res.redirect(req.session.returnTo || '/');
    });

    cb(null, strategy);
  }

  return {
    start,
  };
};
