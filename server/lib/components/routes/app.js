import path from 'path';
import express from 'systemic-express/express';

const APP_ROUTES = /^(?!(?:\/api\/|\/__\/)).*/;

module.exports = function() {

  function start({ app, config, loggerMiddleware, }, cb) {

    const clientApp = function(status) {
      return (req, res, next) => {
        res.set('Cache-Control', 'public, max-age=600, must-revalidate');
        res.status(status);
        res.sendFile(path.join(process.cwd(), 'client', 'build', 'index.html'));
      };
    };

    // Disable logging for Kubernetes
    app.use((req, res, next) => {
      if (!req.headers['user-agent']) return next();
      if (!req.headers['user-agent'].includes('kube-probe')) return next();
      loggerMiddleware.disable(req, res, next);
    });

    // Always serve the app from root
    app.get('/index.html', (req, res) => res.redirect(301, '/'));

    // Handle requests to the client app without disabling logging
    app.get([
      /^\/$/,
      '/releases/:release?',
      '/deployments/:deployment?',
    ], clientApp(200));

    // Serve other static resources with logging disabled
    app.get(APP_ROUTES, loggerMiddleware.disable, express.static('./client/build', {
      setHeaders: (res, path) => {
        res.set('Cache-Control', 'public, max-age=600, must-revalidate');
      },
    }));

    // Ensure client 404's are handled by the app
    app.get(APP_ROUTES, loggerMiddleware.enable, clientApp(404));

    cb();
  }

  return {
    start,
  };
};
