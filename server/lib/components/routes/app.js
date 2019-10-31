import path from 'path';
import express from 'systemic-express/express';

const APP_ROUTES = /^(?!(?:\/auth\/|\/api\/|\/__\/|\/login)).*/;
const ROUTES_TO_AUTHENTICATE = /^(?!(?:\/auth\/|\/api\/|\/__\/|\/login|\/manifest|\/favicon|\/.*\.png|\/.*\.svg)).*/; // A misnomer as this is regex actually parses as what 'not' to look for...


module.exports = function() {

  function start({ app, config, loggerMiddleware, auth, passport }, cb) {

    app.use(ROUTES_TO_AUTHENTICATE, auth('app'));

    const clientApp = function(status) {
      return (req, res, next) => {
        if (!req.user) return res.redirect('/login');
        res.set('Cache-Control', 'public, max-age=600, must-revalidate');
        res.status(status);
        res.sendFile(path.join(process.cwd(), 'client', 'build', 'index.html'));
      };
    };

    app.get('/login', (req, res) => {
      if (req.isAuthenticated()) {
        return res.redirect('/');
      }
      req.session.returnTo = req.query.return || '/';
      req.session.save(() => { // Thanks express session for your race conditions, forcing me to have to do this.
        res.set('Cache-Control', 'public, max-age=600, must-revalidate');
        res.status(200);
        res.sendFile(path.join(process.cwd(), 'client', 'build', 'login.html'));
      });
    });

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
      /^\/accounts(?:\/.)*/,
      /^\/deployments(?:\/.)*/,
      /^\/namespaces(?:\/.)*/,
      /^\/registries(?:\/.)*/,
      /^\/releases(?:\/.)*/,
      /^\/services(?:\/.)*/,
      /^\/audit(?:\/.)*/,
      /^\/teams(?:\/.)*/,
    ], clientApp(200));

    // Serve other static resources with logging disabled
    app.use('/loginAssets', loggerMiddleware.disable, express.static('./client/build/loginAssets', {
      setHeaders: (res, path) => {
        res.set('Cache-Control', 'public, max-age=600, must-revalidate');
      },
    }));

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
