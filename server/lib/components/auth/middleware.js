export default function() {

  function start({ config, }, cb) {

    function auth(permission) {

      function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();
        req.session.returnTo = req.originalUrl || req.url;
        res.redirect(302, config.loginUrl);
      }

      function checkPermissions(req, res, next) {
        // TODO Check permissions
        res.locals.logger.info(`Granting user ${req.user.id} access to ${req.url}`);
        next();
      }

      return [ checkAuthenticated, checkPermissions, ];
    }

    cb(null, auth);
  }

  return {
    start,
  };
}
