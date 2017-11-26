export default function() {

  function start({ config, }, cb) {

    function auth(permission) {

      return function(req, res, next) {
        if (!req.isAuthenticated()) {
          req.session.returnTo = req.originalUrl || req.url;
          return res.redirect(302, config.loginUrl);
        }

        // TODO Check permissions

        res.locals.logger.info(`Granting user ${req.user.id} access to ${req.url}`);
        next();
      };
    }

    cb(null, auth);
  }

  return {
    start,
  };
}
