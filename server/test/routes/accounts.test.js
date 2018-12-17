import expect from 'expect';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import {
  makeAccount,
  makeIdentity,
  makeRegistry,
  makeCluster,
  makeNamespace,
  makeRootMeta,
  makeMeta,
  makeRequestWithDefaults,
  makeRequestFilter,
} from '../factories';

describe('Accounts API', () => {

  let request;
  let config;
  let system = { stop: new Promise(cb => cb()) };
  let store = { nuke: new Promise(cb => cb()) };

  const loggerOptions = {};

  before(async () => {
    system = createSystem()
      .set('transports.human', human(loggerOptions)).dependsOn('config');

    ({ config, store } = await system.start());
    request = makeRequestWithDefaults(config);
  });

  beforeEach(async () => {
    await store.nuke();
  });

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });

  describe('GET /api/account', () => {
    it('should return the current account information', async () => {
      const account = await request({
        url: `/api/account`,
        method: 'GET',
      });

      expect(account.displayName).toBe('Bob Holness');
    });
  });

  describe('GET /api/accounts', () => {

    beforeEach(async () => {

      const accounts = [];
      for (var i = 0; i < 60; i++) {
        accounts.push({
          data: makeAccount(),
          meta: makeRootMeta(),
        });
      }

      await Promise.all(accounts.map(async account => {
        await store.saveAccount(account.data, account.meta);
      }));
    });

    it('should return a list of accounts', async () => {
      const accounts = await request({
        url: `/api/accounts`,
        method: 'GET',
      });

      expect(accounts.count).toBe(62);
      expect(accounts.offset).toBe(0);
      expect(accounts.limit).toBe(50);
      expect(accounts.items.length).toBe(50);
    });

    it('should limit accounts list', async () => {

      const accounts = await request({
        url: `/api/accounts`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
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
        url: `/api/accounts`,
        qs: { limit: 50, offset: 22 },
        method: 'GET',
      });

      expect(accounts.count).toBe(62);
      expect(accounts.offset).toBe(22);
      expect(accounts.limit).toBe(50);
      expect(accounts.items.length).toBe(40);
    });

    describe('filters', () => {
      it('should filter by account name', async () => {
        await store.nuke();
        const account1 = await store.saveAccount(makeAccount({
          displayName: 'acc1',
        }), makeRootMeta());

        await store.saveAccount(makeAccount({
          displayName: 'acc2',
        }), makeRootMeta());

        const releases = await request({
          url: `/api/accounts`,
          qs: { 'name': makeRequestFilter('1', { exact: false }) },
          method: 'GET',
        });

        expect(releases.count).toBe(1);
        expect(releases.items[0].displayName).toBe(account1.displayName);
      });

      it('should filter by account name exactly', async () => {
        await store.nuke();
        const account1 = await store.saveAccount(makeAccount({
          displayName: 'acc1',
        }), makeRootMeta());

        await store.saveAccount(makeAccount({
          displayName: 'acc12',
        }), makeRootMeta());

        const releases = await request({
          url: `/api/accounts`,
          qs: { 'name': makeRequestFilter('acc1', { exact: true }) },
          method: 'GET',
        });

        expect(releases.count).toBe(1);
        expect(releases.items[0].displayName).toBe(account1.displayName);
      });

      it('should filter by createdBy', async () => {
        await store.nuke();
        const account1 = await store.saveAccount(makeAccount({
          displayName: 'acc1',
        }), makeRootMeta());
        await store.saveAccount(makeAccount({
          displayName: 'acc12',
        }), makeMeta({ account: account1 }));

        const releases = await request({
          url: `/api/accounts`,
          qs: { 'createdBy': makeRequestFilter('acc', { exact: false }) },
          method: 'GET',
        });

        expect(releases.count).toBe(1);
      });

      it('should filter by createdBy', async () => {
        await store.nuke();
        const account1 = await store.saveAccount(makeAccount({
          displayName: 'acc1',
        }), makeRootMeta());
        const account2 = await store.saveAccount(makeAccount({
          displayName: 'acc12',
        }), makeMeta({ account: account1 }));
        await store.saveAccount(makeAccount({
          displayName: 'acc123',
        }), makeMeta({ account: account2 }));

        const releases = await request({
          url: `/api/accounts`,
          qs: { 'createdBy': makeRequestFilter('acc1', { exact: true }) },
          method: 'GET',
        });

        expect(releases.count).toBe(1);
      });
    });

  });

  describe('GET /api/accounts/:id', () => {

    it('should return the requested account', async () => {

      const data = makeAccount();
      const saved = await store.saveAccount(data, makeRootMeta());

      const account = await request({
        url: `/api/accounts/${saved.id}`,
        method: 'GET',
      });

      expect(account.id).toBe(saved.id);
    });

    it('should return 404 for missing accounts', async () => {

      await request({
        url: `/api/accounts/142bc001-1819-459b-bf95-14e25be17fe5`,
        method: 'GET',
        resolveWithFullResponse: true,
      }).then(() => {
        throw new Error('Should have failed with 404');
      }).catch(errors.StatusCodeError, (reason) => {
        expect(reason.response.statusCode).toBe(404);
      });
    });
  });

  describe('GET /api/account/hasPermission/:permission', () => {
    it('should return results for a global permission', async () => {
      const result = await request({
        url: `/api/account/hasPermission/accounts-write`,
        method: 'GET'
      });

      expect(result.answer).toBe(true);
    });
  });

  describe('GET /api/account/hasPermission/:permission/on/:type/:id', () => {
    it('should return results for namespacesOfUserCurrentUserCanSee', async () => {
      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());

      const result = await request({
        url: `/api/account/hasPermission/namespaces-read/on/namespace/${namespace.id}`,
        method: 'GET'
      });

      expect(result.answer).toBe(true);
    });

    it('should return results for registry', async () => {
      const result = await request({
        url: `/api/account/hasPermission/registries-read/on/registry/00000000-0000-0000-0000-000000000000`,
        method: 'GET'
      });

      expect(result.answer).toBe(true);
    });
  });

  describe('POST /api/accounts', () => {

    it('should save an account', async () => {

      const data = makeAccount();

      const response = await request({
        url: `/api/accounts`,
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
        url: `/api/accounts`,
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

      const saved = await store.saveAccount(makeAccount(), makeRootMeta());

      const response = await request({
        url: `/api/accounts/${saved.id}`,
        method: 'DELETE',
        resolveWithFullResponse: true,
      });

      expect(response.statusCode).toBe(204);

      const account = await store.getAccount(saved.id);
      expect(account).toBe(undefined);
    });
  });

  describe('POST /api/identities', () => {

    it('should save an account identity', async () => {

      const saved = await store.saveAccount(makeAccount(), makeRootMeta());
      const data = makeIdentity();

      const response = await request({
        url: `/api/identities`,
        method: 'POST',
        json: { account: saved.id, ...data },
      });

      expect(response.id).toBeDefined();

      const account = await store.findAccount({ ...data });
      expect(account).toBeDefined();
      expect(account.displayName).toBe(saved.displayName);
    });

    it('should reject payloads without an account', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `/api/identities`,
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
        url: `/api/identities`,
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
        url: `/api/identities`,
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
        url: `/api/identities`,
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

  describe('POST /api/roles/namespace', () => {

    it('should grant a role on a namespace to an account', async () => {

      const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
      const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());
      const saved = await store.saveAccount(makeAccount(), makeRootMeta());

      const response = await request({
        url: `/api/roles/namespace`,
        method: 'POST',
        json: {
          account: saved.id,
          role: 'admin',
          namespace: namespace.id,
        },
      });

      expect(response.currentRoles).toBeDefined();
      expect(response.namespacesWithoutRoles).toBeDefined();
      expect(response.rolesGrantable).toBeDefined();
      expect(response.currentRoles.length).toBe(1);
      const entry = response.currentRoles[0];
      expect(entry.namespace.id).toBe(namespace.id);
      expect(entry.roles).toMatchObject(['admin']);
    });

    it('should reject payloads without an account', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `/api/roles/namespace`,
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
        url: `/api/roles/namespace`,
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
        url: `/api/roles/namespace`,
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

      const registry = await store.saveRegistry(makeRegistry(), makeRootMeta());
      const saved = await store.saveAccount(makeAccount(), makeRootMeta());

      const response = await request({
        url: `/api/roles/registry`,
        method: 'POST',
        json: {
          account: saved.id,
          role: 'admin',
          registry: registry.id,
        },
      });

      expect(response.currentRoles).toBeDefined();
      expect(response.registriesWithoutRoles).toBeDefined();
      expect(response.rolesGrantable).toBeDefined();
      expect(response.currentRoles.length).toBe(1);
      const entry = response.currentRoles[0];
      expect(entry.registry.id).toBe(registry.id);
      expect(entry.roles).toMatchObject(['admin']);
    });

    it('should reject payloads without an account', async () => {

      loggerOptions.suppress = true;

      await request({
        url: `/api/roles/registry`,
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
        url: `/api/roles/registry`,
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
        url: `/api/roles/registry`,
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

});
