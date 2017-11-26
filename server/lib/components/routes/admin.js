export default function(options = {}) {

  function start({ pkg, app, loggerMiddleware, }, cb) {

    app.get('/__/*', (req, res, next) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      next();
    });

    app.get('/__/status', loggerMiddleware.disable, (req, res) => {
      res.json({ name: pkg.name, version: pkg.version, description: pkg.description, });
    });

    cb();
  }

  return {
    start,
  };
}
