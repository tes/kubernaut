import { Strategy as GitHubStrategy, } from 'passport-github';

/*
 Using 'module.exports' to workaround TypeError require is not a function
 See https://stackoverflow.com/questions/33007878/nodejs-typeerror-require-is-not-a-function
*/
module.exports = function() {

  function start({ config, logger, app, passport, store, }, cb) {

    logger.info('Initialising github authentication strategy');

    const strategy = new GitHubStrategy({
      clientID: config.client.id,
      clientSecret: config.client.secret,
      passReqToCallback: true,
    }, async (req, accessToken, refreshToken, profile, cb) => {
      try {
        const personal = { displayName: profile.displayName || profile.username, avatar: profile.photos.map(p => p.value)[0], };
        const identity = { name: profile.id, provider: profile.provider, 'type': 'OAuth', };
        const meta = { date: new Date(), account: '00000000-0000-0000-0000-000000000000', };
        const account = await store.ensureAccount(personal, identity, meta);
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

    cb(null, { name: strategy.name, app: true, api: false, });
  }

  return {
    start,
  };
};
