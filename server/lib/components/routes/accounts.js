import bodyParser from 'body-parser';
import Boom from 'boom';

export default function(options = {}) {

  function start({ pkg, app, loggerMiddleware, store, auth, }, cb) {

    app.use('/api/accounts', auth('api'));
    app.use('/api/identities', auth('api'));
    app.use('/api/roles', auth('api'));

    app.get('/api/accounts', async (req, res, next) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
        const result = await store.listAccounts(limit, offset);
        res.json(result);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/accounts/:id', async (req, res, next) => {
      try {
        const account = await store.getAccount(req.params.id);
        return account ? res.json(account) : next();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/accounts', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.displayName) return next(Boom.badRequest('displayName is required'));
        const data = { displayName: req.body.displayName, };
        const meta = { date: new Date(), account: { id: req.user.id, }, };
        const account = await store.saveAccount(data, meta);
        res.json(account);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/accounts/:id', async (req, res, next) => {
      try {
        const meta = { date: new Date(), account: { id: req.user.id, }, };
        await store.deleteAccount(req.params.id, meta);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/identities', bodyParser.json(), async (req, res, next) => {
      try {
        if (!req.body.account) return next(Boom.badRequest('account is required'));
        if (!req.body.name) return next(Boom.badRequest('name is required'));
        if (!req.body.provider) return next(Boom.badRequest('provider is required'));
        if (!req.body.type) return next(Boom.badRequest('type is required'));

        const data = { name: req.body.name, provider: req.body.provider, type: req.body.type, };
        const meta = { date: new Date(), account: { id: req.user.id, }, };
        const identity = await store.saveIdentity(req.body.account, data, meta);
        res.json(identity);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/identities/:id', async (req, res, next) => {
      try {
        await store.deleteIdentity(req.params.id, { date: new Date(), account: req.user.id, });
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/roles', bodyParser.json(), async (req, res, next) => {

      if (!req.body.account) return next(Boom.badRequest('account is required'));
      if (!req.body.role) return next(Boom.badRequest('role is required'));

      try {
        const meta = { date: new Date(), account: { id: req.user.id, }, };
        const account = await store.grantRoleOnNamespace(req.body.account, req.body.role, null, meta);
        res.json(account);
      } catch (err) {
        next(err);
      }
    });

    app.delete('/api/roles/:id', async (req, res, next) => {
      try {
        await store.revokeRoleOnNamespace(req.params.id, { date: new Date(), account: req.user.id, });
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    });

    cb();
  }

  return {
    start,
  };
}
