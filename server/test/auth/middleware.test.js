import express from 'systemic-express/express';
import request from 'request-promise';
import errors from 'request-promise/errors';
import session from 'express-session';
import Boom from 'Boom';
import middleware from '../../lib/components/auth/middleware';

describe('Auth Middleware', () => {

    const port = 13003;
    let server;

    beforeAll(done => {
      startServer(done);
    });

    afterAll(done => {
      stopServer(done);
    });

    it('should allow authenticated users', async () => {
      const res = await request({
        url: `http://localhost:${port}/authenticated`,
        resolveWithFullResponse: true,
      });
      expect(res.statusCode).toBe(204);
    });

    it('should redirect unauthenticated users', async () => {
      await request({
        url: `http://localhost:${port}/unauthenticated`,
        resolveWithFullResponse: true,
        followRedirect: false,
      }).then(() => {
        throw new Error('Should have failed with 302');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.statusCode).toBe(302);
        expect(reason.response.headers.location).toBe('/auth/test');
      });
    });

    function startServer(cb) {
      const app = express();
      app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true, }));
      app.locals.loginUrl = '/auth/test';
      server = app.listen(port, err => {
        if (err) return cb(err);
        middleware().start({ config: { loginUrl: '/auth/test', }, }, (err, auth) => {
          if (err) return cb(err);
          app.use((req, res, next) => {
            res.locals.logger = { info: () => {}, };
            next();
          });
          app.get('/authenticated', login, auth('client'), (req, res) => res.status(204).send());
          app.get('/unauthenticated', auth('client'), (req, res) => res.status(204).send());
          app.use((err, req, res, next) => {
            console.log(err)
            res.status(Boom.isBoom(err) ? err.output.statusCode : 500).send()
          });
          cb();
        });
      });
    }

    function login(req, res, next) {
      req.user = { id: req.params.user, };
      next();
    }

    function stopServer(cb) {
      if (!server) return cb();
      server.close(cb);
    }
});
