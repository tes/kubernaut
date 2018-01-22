import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeAccount, makeIdentity, makeRegistry, makeCluster, makeNamespace, makeMeta, } from '../factories';

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
      for (var i = 0; i < 60; i++) {
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

      expect(accounts.count).toBe(62);
      expect(accounts.offset).toBe(0);
      expect(accounts.limit).toBe(50);
      expect(accounts.items.length).toBe(50);
    });

    it('should limit accounts list', async () => {

      const accounts = await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts`,
        qs: { limit: 40, offset: 0, },
        method: 'GET',
        json: true,
      });

      expect(accounts.count).toBe(62);
      expect(accounts.offset).toBe(0);
      expect(accounts.limit).toBe(40);
      expect(accounts.items.length).toBe(40);
    });

    it('should page accounts list', async () => {

      // Offset is 22 because root account is automatically created
      // and while using local auth strategy an admin account will
      // also be created

      const accounts = await request({
        url: `http://${config.server.host}:${config.server.port}/api/accounts`,
        qs: { limit: 50, offset: 22, },
        method: 'GET',
        json: true,
      });

      expect(accounts.count).toBe(62);
      expect(accounts.offset).toBe(22);
      expect(accounts.limit).toBe(50);
      expect(accounts.items.length).toBe(40);
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


  describe('POST /api/roles/namespace', () => {

    it('should grant a role on a namespace to an account', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster, }), makeMeta());
      const saved = await store.saveAccount(makeAccount(), makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/namespace`,
        method: 'POST',
        json: {
          account: saved.id,
          role: 'admin',
          namespace: namespace.id,
        },
      });

      expect(response.id).toBeDefined();

      const account = await store.getAccount(saved.id);
      expect(account).toBeDefined();
      expect(account.roles.admin).toBeDefined();
      expect(account.roles.admin.namespaces).toEqual([namespace.id,]);
    });

    it('should reject payloads without an account', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/namespace`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          role: 'admin',
          namespace: 'ns',
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
        url: `http://${config.server.host}:${config.server.port}/api/roles/namespace`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          account: 'acc',
          namespace: 'ns',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('role is required');
      });
    });

    it('should reject payloads without a namespace', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/namespace`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          account: 'acc',
          role: 'admin',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('namespace is required');
      });
    });
  });

  describe('POST /api/roles/registry', () => {

    it('should grant a role on a registry to an account', async () => {

      const registry = await store.saveRegistry(makeRegistry(), makeMeta());
      const saved = await store.saveAccount(makeAccount(), makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/registry`,
        method: 'POST',
        json: {
          account: saved.id,
          role: 'admin',
          registry: registry.id,
        },
      });

      expect(response.id).toBeDefined();

      const account = await store.getAccount(saved.id);
      expect(account).toBeDefined();
      expect(account.roles.admin).toBeDefined();
      expect(account.roles.admin.registries).toEqual([ registry.id, ]);
    });

    it('should reject payloads without an account', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/registry`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          role: 'admin',
          registry: 'reg',
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
        url: `http://${config.server.host}:${config.server.port}/api/roles/registry`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          account: 'acc',
          registry: 'reg',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('role is required');
      });
    });

    it('should reject payloads without a registry', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/registry`,
        method: 'POST',
        resolveWithFullResponse: true,
        json: {
          account: 'acc',
          role: 'admin',
        },
      }).then(() => {
        throw new Error('Should have failed with 400');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(400);
        expect(reason.response.body.message).toBe('registry is required');
      });
    });
  });

  describe('DELETE /api/roles/registry/:roleId', () => {

    it('should delete a role', async () => {

      const saved = await store.saveAccount(makeAccount(), makeMeta());
      const role = await store.grantRoleOnRegistry(saved.id, 'admin', null, makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/registry/${role.id}`,
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

  describe('DELETE /api/roles/namespace/:roleId', () => {

    it('should delete a role', async () => {

      const saved = await store.saveAccount(makeAccount(), makeMeta());
      const role = await store.grantRoleOnNamespace(saved.id, 'admin', null, makeMeta());

      const response = await request({
        url: `http://${config.server.host}:${config.server.port}/api/roles/namespace/${role.id}`,
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
