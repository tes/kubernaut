import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeAccount, makeIdentity, makeMeta, } from '../factories';

describe('Accounts API', () => {

  let config;
  let system = { stop: cb => cb(), };
  let store = { nuke: new Promise(cb => cb()), };

  const loggerOptions = {};

  beforeAll(cb => {
    system = createSystem()
    .set('config.overrides', { server: { port: 13003, }, })
    .set('transports.human', human(loggerOptions)).dependsOn('config')
    .start((err, components) => {
      if (err) return cb(err);
      config = components.config;
      store = components.store;
      cb();
    });
  });

  beforeEach(cb => {
    store.nuke().then(cb);
  });

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  afterAll(cb => {
    system.stop(cb);
  });

  describe('GET /api/accounts', () => {

    beforeEach(async () => {

      const accounts = [];
      for (var i = 0; i < 51; i++) {
        accounts.push({
          data: makeAccount(),
          meta: makeMeta(),
        });
      }

      await Promise.all(accounts.map(async account => {
        await store.saveAccount(account.data, account.meta);
      }));
    });

    it('should return a list of accounts', async () => {
      const accounts = await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts`,
        method: 'GET',
        json: true,
      });

      expect(accounts.length).toBe(50);
    });

    it('should limit results', async () => {

      const accounts = await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(accounts.length).toBe(40);
    });

    it('should page results', async () => {

      const accounts = await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts`,
        qs: { limit: 50, offset: 10, },
        method: 'GET',
        json: true,
      });
      // +1 because kubernaut creates an admin account when running locally
      expect(accounts.length).toBe(41 + 1);
    });

  });

  describe('GET /api/accounts/:id', () => {

    it('should return the requested account', async () => {

      const data = makeAccount();
      const saved = await store.saveAccount(data, makeMeta());

      const account = await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts/${saved.id}`,
        method: 'GET',
        json: true,
      });

      expect(account.id).toBe(saved.id);
    });

    it('should return 404 for missing accounts', async () => {

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts/does-not-exist`,
        method: 'GET',
        resolveWithFullResponse: true,
        json: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
      });
    });
  });

  describe('POST /api/accounts', () => {

    it('should save an account', async () => {

      const data = makeAccount();

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts`,
        method: 'POST',
        json: data,
      });

      expect(response.id).toBeDefined();

      const account = await store.getAccount(response.id);

      expect(account).toBeDefined();
      expect(account.displayName).toBe(data.displayName);
    });

    it('should reject payloads without a display name', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {},
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('displayName is required');
      });
    });

  });

  describe('DELETE /api/accounts/:id', () => {

    it('should delete an account', async () => {

      const saved = await store.saveAccount(makeAccount(), makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);

      const account = await store.getAccount(saved.id);
      expect(account).toBe(undefined);
    });
  });

  describe('POST /api/identities', () => {

    it('should save an account identity', async () => {

      const saved = await store.saveAccount(makeAccount(), makeMeta());
      const data = makeIdentity();

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/identities`,
        method: 'POST',
        json: { account: saved.id, ...data, },
      });

      expect(response.id).toBeDefined();

      const account = await store.findAccount({ ...data, });
      expect(account).toBeDefined();
      expect(account.displayName).toBe(saved.displayName);
    });

    it('should reject payloads without an account', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/identities`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          name: 'foo',
          provider: 'bar',
          type: 'baz',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('account is required');
      });
    });

    it('should reject payloads without a name', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/identities`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          account: 'acc',
          provider: 'bar',
          type: 'baz',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('name is required');
      });
    });

    it('should reject payloads without a provider', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/identities`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          account: 'acc',
          name: 'foo',
          type: 'baz',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('provider is required');
      });
    });


    it('should reject payloads without a type', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/identities`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          account: 'acc',
          name: 'foo',
          provider: 'bar',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('type is required');
      });
    });
  });

  describe('DELETE /api/identities/:identityId', () => {

    it('should delete an identity', async () => {

      const saved = await store.saveAccount(makeAccount(), makeMeta());
      const identity = await store.saveIdentity(saved.id, makeIdentity(), makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/identities/${identity.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);

      const account = await store.findAccount({ ...identity, });
      expect(account).toBe(undefined);
    });
  });


  describe('POST /api/roles', () => {

    it('should grant a role to an account', async () => {

      const saved = await store.saveAccount(makeAccount(), makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles`,
        method: 'POST',
        json: {
          account: saved.id,
          role: 'admin',
        },
      });

      expect(response.id).toBeDefined();

      const account = await store.getAccount(saved.id);
      expect(account).toBeDefined();
      expect(account.roles.admin).toBeDefined();
    });

    it('should reject payloads without an account', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          role: 'admin',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('account is required');
      });
    });

    it('should reject payloads without a role', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          account: 'acc',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('role is required');
      });
    });
  });

  describe('DELETE /api/roles/:roleId', () => {

    it('should delete a role', async () => {

      const saved = await store.saveAccount(makeAccount(), makeMeta());
      const role = await store.grantRole(saved.id, 'admin', makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/${role.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
        json: true,
      });

      expect(response.statusCode).toBe(204);

      const account = await store.getAccount(saved.id);
      expect(account).toBeDefined();
      expect(account.roles.admin).toBe(undefined);
    });
  });

});
