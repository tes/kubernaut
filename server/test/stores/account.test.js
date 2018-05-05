import { v4 as uuid, } from 'uuid';
import createSystem from '../test-system';
import { makeIdentity, makeAccount, makeRegistry, makeCluster, makeNamespace, makeRootMeta, } from '../factories';

describe('Account Store', () => {

  let system = { stop: cb => cb(), };
  let store = { nuke: () => {}, };

  beforeAll(cb => {
    system = createSystem().remove('server').start((err, components) => {
      if (err) return cb(err);
      store = components.store;
      cb();
    });
  });

  beforeEach(async cb => {
    await store.nuke();
    cb();
  });

  afterAll(async cb => {
    await store.nuke();
    system.stop(cb);
  });

  describe('Save Account', () => {

    it('should create an account', async () => {
      const account = await saveAccount();
      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
    });

    it('should permit duplicate display names', async () => {
      const data1 = makeAccount({ displayName: 'John', });
      await saveAccount(data1);

      const data2 = makeAccount({ displayName: 'John', });
      await saveAccount(data2);
    });

  });

  describe('Get Account', () => {

    it('should retrieve account by id', async () => {
      const data = makeAccount({ displayName: 'Foo Bar', });
      const meta = makeRootMeta();
      const saved = await saveAccount(data, meta);
      const account = await getAccount(saved.id);

      expect(account).toBeDefined();
      expect(account.id).toBe(saved.id);
      expect(account.displayName).toBe('Foo Bar');
      expect(account.createdOn.toISOString()).toBe(meta.date.toISOString());
      expect(account.createdBy.id).toBe(meta.account.id);
    });

    it('should return undefined when account not found', async () => {
      const account = await getAccount(uuid());
      expect(account).toBe(undefined);
    });

    it('should return undefined when account deleted', async () => {
      const saved = await saveAccount();
      await deleteAccount(saved.id);

      const account = await getAccount(saved.id);
      expect(account).toBe(undefined);
    });
  });

  describe('Find Account', () => {

    it('should find an account by identity, provider and type', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
      await saveIdentity(saved.id, data);

      const account = await findAccount({ name: 'foo', provider: 'bar', type: 'baz', });
      expect(account).toBeDefined();
      expect(account.id).toBe(saved.id);
    });

    it('should return undefined when identity name not found', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
      await saveIdentity(saved.id, data);

      const account = await findAccount({ name: 'missing', provider: 'bar', type: 'baz', });
      expect(account).toBe(undefined);
    });

    it('should return undefined when provider not found', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
      await saveIdentity(saved.id, data);

      const account = await findAccount({ name: 'foo', provider: 'missing', type: 'baz',});
      expect(account).toBe(undefined);
    });

    it('should return undefined when type not found', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
      await saveIdentity(saved.id, data);

      const account = await findAccount({ name: 'foo', provider: 'bar', type: 'missing',});
      expect(account).toBe(undefined);
    });

    it('should return undefined when account deleted', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
      await saveIdentity(saved.id, data);
      await deleteAccount(saved.id);

      const account = await findAccount({ identity: 'foo', provider: 'bar', type: 'baz', });
      expect(account).toBe(undefined);
    });

    it('should return undefined when identity and provider were deleted', async () => {
      const savedAccount = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz', });
      const identity = await saveIdentity(savedAccount.id, data);
      await deleteIdentity(identity.id);

      const account = await findAccount({ identity: 'foo', provider: 'bar', type: 'baz', });
      expect(account).toBe(undefined);
    });

  });

  describe('Ensure Account', () => {

    it('should return existing account if it already exists', async () => {
      const accountData = makeAccount();
      const identityData = makeIdentity();
      const saved = await saveAccount(accountData);
      await saveIdentity(saved.id, identityData);

      const account = await ensureAccount(accountData, identityData);
      expect(account.id).toBe(saved.id);
    });

    it('should create a new account if the identity doesnt previously exist', async () => {
      const accountData = makeAccount();
      const identityData = makeIdentity();
      const saved = await saveAccount(accountData);

      const account = await ensureAccount(accountData, identityData);
      expect(account.id).toBeDefined();
      expect(account.id).not.toBe(saved.id);
    });

    it('should assign admin role when there are no other active admins', async () => {
      const namespace = await saveNamespace();
      const account1Data = makeAccount();
      const identity1Data = makeIdentity();
      const saved = await saveAccount(account1Data);
      await saveIdentity(saved.id, identity1Data);

      const account2Data = makeAccount();
      const identity2Data = makeIdentity();
      const account = await ensureAccount(account2Data, identity2Data);
      expect(account.id).toBeDefined();
      expect(Object.keys(account.roles)).toEqual(['admin',]);
      expect(account.roles.admin.registries).toEqual(['00000000-0000-0000-0000-000000000000',]);
      expect(account.roles.admin.namespaces).toEqual([namespace.id,]);
    });

    it('should assign no roles to a new account when there are already active global admins', async () => {
      const account1Data = makeAccount();
      const identity1Data = makeIdentity();
      const saved = await saveAccount(account1Data);
      await saveIdentity(saved.id, identity1Data);
      await grantRoleOnRegistry(saved.id, 'admin', null);
      await grantRoleOnNamespace(saved.id, 'admin', null);

      const account2Data = makeAccount();
      const identity2Data = makeIdentity();
      const account = await ensureAccount(account2Data, identity2Data);
      expect(account.id).toBeDefined();
      expect(Object.keys(account.roles)).toEqual([]);
    });

  });

  describe('Find Accounts', () => {

    it('should list accounts, ordered by display name asc', async () => {

      const accounts = [
        {
          data: makeAccount({ displayName: 'c', }),
        },
        {
          data: makeAccount({ displayName: 'a', }),
        },
        {
          data: makeAccount({ displayName: 'b', }),
        },
      ];

      await Promise.all(accounts.map(account => {
        return saveAccount(account.data);
      }));

      const results = await findAccounts();
      expect(results.items.map(a => a.displayName)).toEqual(['a', 'b', 'c', 'root',]);
      expect(results.count).toBe(4);
      expect(results.limit).toBe(50);
      expect(results.offset).toBe(0);
    });

    it('should exclude inactive accounts', async () => {
      const results1 = await findAccounts();
      expect(results1.items.length).toBe(1);
      expect(results1.count).toBe(1);

      const saved = await saveAccount(makeAccount());
      const results2 = await findAccounts();
      expect(results2.items.length).toBe(2);
      expect(results2.count).toBe(2);

      await deleteAccount(saved.id);
      const results3 = await findAccounts();
      expect(results3.items.length).toBe(1);
      expect(results3.count).toBe(1);
    });

    describe('Pagination', () => {

      beforeEach(async () => {
        const accounts = [];
        for (var i = 0; i < 51; i++) {
          accounts.push({
            data: makeAccount({
              // Must be alphebetically greater than 'root'
              displayName: `x-account-${i}`,
            }),
          });
        }

        await Promise.all(accounts.map(async account => {
          return saveAccount(account.data);
        }));
      });

      it('should limit accounts to 50 by default', async () => {
        const results = await findAccounts();
        expect(results.items.length).toBe(50);
        expect(results.count).toBe(52);
        expect(results.limit).toBe(50);
        expect(results.offset).toBe(0);
      });

      it('should limit accounts to the specified number', async () => {
        const results = await findAccounts({}, 10, 0);
        expect(results.items.length).toBe(10);
        expect(results.count).toBe(52);
        expect(results.limit).toBe(10);
        expect(results.offset).toBe(0);
      });

      it('should page accounts list', async () => {
        const results = (await findAccounts({}, 50, 10));
        expect(results.items.length).toBe(42);
        expect(results.count).toBe(52);
        expect(results.limit).toBe(50);
        expect(results.offset).toBe(10);
      });
    });
  });

  describe('Save Identity', () => {

    it('should create an identity', async () => {
      const account = await saveAccount();
      const identity = await saveIdentity(account.id);
      expect(identity).toBeDefined();
    });

    it('should prevent duplicate active identities for an account', async () => {
      const account = await saveAccount();
      const data = makeIdentity();

      await saveIdentity(account.id, data);
      await expect(
        saveIdentity(account.id, data)
      ).rejects.toHaveProperty('code', '23505');
    });

    it('should prevent duplicate active identities for different accounts', async () => {
      const account1 = await saveAccount();
      const account2 = await saveAccount();
      const data1 = makeIdentity({ name: 'duplicate-name', provider: 'duplicate-provider', type: 'duplicate-type', });
      const data2 = makeIdentity({ name: 'duplicate-name', provider: 'duplicate-provider', type: 'duplicate-type', });

      await saveIdentity(account1.id, data1);
      await expect(
        saveIdentity(account2.id, data2)
      ).rejects.toHaveProperty('code', '23505');
    });

    it('should permit duplicate identity names for different providers', async () => {
      const account = await saveAccount();
      const data1 = makeIdentity({ name: 'duplidate-name', });
      const data2 = makeIdentity({ name: 'duplidate-name', });

      await saveIdentity(account.id, data1);
      await saveIdentity(account.id, data2);
    });

    it('should permit duplicate providers for an account', async () => {
      const account = await saveAccount();
      const data1 = makeIdentity({ provider: 'duplicate-provider', });
      const data2 = makeIdentity({ provider: 'duplicate-provider', });

      await saveIdentity(account.id, data1);
      await saveIdentity(account.id, data2);
    });

    it('should permit duplicate deleted identities', async () => {
      const account = await saveAccount();
      const data = makeIdentity();

      const saved = await saveIdentity(account.id, data);
      await deleteIdentity(saved.id);
      await saveIdentity(account.id, data);
    });

    it('should report an error if account does not exist', async () => {
      const data = makeIdentity();

      await expect(
        saveIdentity(uuid(), data)
      ).rejects.toHaveProperty('code', '23502');
    });

    it('should report an error if account was deleted', async () => {
      const account = await saveAccount();
      await deleteAccount(account.id);
      const data = makeIdentity();

      await expect(
        saveIdentity(account.id, data)
      ).rejects.toHaveProperty('code', '23502');
    });

  });

  describe('Grant Role On Registry', () => {

    it('should grant a role on all registries to an account', async () => {
      const saved = await saveAccount();

      const role = await grantRoleOnRegistry(saved.id, 'admin', null);
      expect(role.id).toBeDefined();

      const account = await getAccount(saved.id);
      expect(account).toBeDefined();
      expect(Object.keys(account.roles)).toEqual(['admin',]);
      expect(account.roles.admin.permissions).toContain('accounts-write');
      expect(account.roles.admin.registries).toContain('00000000-0000-0000-0000-000000000000');
    });

    it('should grant a role on s single registry to an account', async () => {
      const registry = await saveRegistry();
      const saved = await saveAccount();

      const role = await grantRoleOnRegistry(saved.id, 'admin', registry.id);
      expect(role.id).toBeDefined();

      const account = await getAccount(saved.id);
      expect(account).toBeDefined();
      expect(Object.keys(account.roles)).toEqual(['admin',]);
      expect(account.roles.admin.permissions).toContain('accounts-write');
      expect(account.roles.admin.registries).toContain(registry.id);
    });

    it('should fail if account does not exist', async () => {
      await expect(
        grantRoleOnRegistry(uuid(), 'admin', null)
      ).rejects.toHaveProperty('code', '23503');
    });

    it('should fail if role does not exist', async () => {
      const saved = await saveAccount();
      await expect(
        grantRoleOnRegistry(saved.id, 'missing', null)
      ).rejects.toHaveProperty('code', '23502');
    });

    it('should fail if registry does not exist', async () => {
      const saved = await saveAccount();
      await expect(
        grantRoleOnRegistry(saved.id, 'admin', 'missing')
      ).rejects.toHaveProperty('code', '22P02');
    });

    it('should tolerate duplicate roles', async () => {
      const saved = await saveAccount();
      await grantRoleOnRegistry(saved.id, 'admin', null);
      await grantRoleOnRegistry(saved.id, 'admin', null);

      const account = await getAccount(saved.id);
      expect(account).toBeDefined();
      expect(Object.keys(account.roles)).toEqual(['admin',]);
    });
  });

  describe('Revoke Role On Registry', () => {

    it('should revoke role from account', async () => {
      const saved = await saveAccount();
      const role = await grantRoleOnRegistry(saved.id, 'admin', null);
      await revokeRoleOnRegistry(role.id);

      const account = await getAccount(saved.id);
      expect(account).toBeDefined();
      expect(Object.keys(account.roles)).toEqual([]);
    });

    it('should tolerate missing role', async () => {
      await revokeRoleOnRegistry(uuid());
    });

    it('should tolerate previously revoked role', async () => {
      const account = await saveAccount();

      const role = await grantRoleOnRegistry(account.id, 'admin', null);
      await revokeRoleOnRegistry(role.id);
      await revokeRoleOnRegistry(role.id);
    });
  });

  describe('Grant Role On Namespace', () => {

    it('should grant a role on all namespaces to an account', async () => {
      const namespace = await saveNamespace();
      const saved = await saveAccount();

      const role = await grantRoleOnNamespace(saved.id, 'admin', null);
      expect(role.id).toBeDefined();

      const account = await getAccount(saved.id);
      expect(account).toBeDefined();
      expect(Object.keys(account.roles)).toEqual(['admin',]);
      expect(account.roles.admin.permissions).toContain('accounts-write');
      expect(account.roles.admin.namespaces).toContain(namespace.id);
    });

    it('should grant a role on s single namespace to an account', async () => {
      const namespace = await saveNamespace();
      const saved = await saveAccount();

      const role = await grantRoleOnNamespace(saved.id, 'admin', namespace.id);
      expect(role.id).toBeDefined();

      const account = await getAccount(saved.id);
      expect(account).toBeDefined();
      expect(Object.keys(account.roles)).toEqual(['admin',]);
      expect(account.roles.admin.permissions).toContain('accounts-write');
      expect(account.roles.admin.namespaces).toContain(namespace.id);
    });

    it('should fail if account does not exist', async () => {
      await expect(
        grantRoleOnNamespace(uuid(), 'admin', null)
      ).rejects.toHaveProperty('code', '23503');
    });

    it('should fail if role does not exist', async () => {
      const saved = await saveAccount();
      await expect(
        grantRoleOnNamespace(saved.id, 'missing', null)
      ).rejects.toHaveProperty('code', '23502');
    });

    it('should fail if namespace does not exist', async () => {
      const saved = await saveAccount();
      await expect(
        grantRoleOnNamespace(saved.id, 'admin', 'missing')
      ).rejects.toHaveProperty('code', '22P02');
    });

    it('should tolerate duplicate roles', async () => {
      const saved = await saveAccount();
      await grantRoleOnNamespace(saved.id, 'admin', null);
      await grantRoleOnNamespace(saved.id, 'admin', null);

      const account = await getAccount(saved.id);
      expect(account).toBeDefined();
      expect(Object.keys(account.roles)).toEqual(['admin',]);
    });
  });


  describe('Revoke Role On Namespace', () => {

    it('should revoke role from account', async () => {
      const saved = await saveAccount();
      const role = await grantRoleOnNamespace(saved.id, 'admin', null);
      await revokeRoleOnNamespace(role.id);

      const account = await getAccount(saved.id);
      expect(account).toBeDefined();
      expect(Object.keys(account.roles)).toEqual([]);
    });

    it('should tolerate missing role', async () => {
      await revokeRoleOnNamespace(uuid());
    });

    it('should tolerate previously revoked role', async () => {
      const account = await saveAccount();

      const role = await grantRoleOnNamespace(account.id, 'admin', null);
      await revokeRoleOnNamespace(role.id);
      await revokeRoleOnNamespace(role.id);
    });
  });


  function saveRegistry(registry = makeRegistry(), meta = makeRootMeta(), ) {
    return store.saveRegistry(registry, meta);
  }

  function saveAccount(account = makeAccount(), meta = makeRootMeta(), ) {
    return store.saveAccount(account, meta);
  }

  function ensureAccount(account = makeAccount(), identity = makeIdentity(), meta = makeRootMeta(), ) {
    return store.ensureAccount(account, identity, meta);
  }

  function getAccount(id) {
    return store.getAccount(id);
  }

  function findAccount(criteria) {
    return store.findAccount(criteria);
  }

  function findAccounts(criteria, limit, offset) {
    return store.findAccounts(criteria, limit, offset);
  }

  function deleteAccount(id, meta = makeRootMeta(), ) {
    return store.deleteAccount(id, meta);
  }

  function saveIdentity(accountId, identity = makeIdentity(), meta = makeRootMeta(), ) {
    return store.saveIdentity(accountId, identity, meta);
  }

  function deleteIdentity(id, meta = makeRootMeta(), ) {
    return store.deleteIdentity(id, meta);
  }

  function grantRoleOnRegistry(id, name, registry, meta = makeRootMeta(), ) {
    return store.grantRoleOnRegistry(id, name, registry, meta);
  }

  function revokeRoleOnRegistry(id, meta = makeRootMeta(), ) {
    return store.revokeRoleOnRegistry(id, meta);
  }

  function grantRoleOnNamespace(id, name, namespace, meta = makeRootMeta(), ) {
    return store.grantRoleOnNamespace(id, name, namespace, meta);
  }

  function revokeRoleOnNamespace(id, meta = makeRootMeta(), ) {
    return store.revokeRoleOnNamespace(id, meta);
  }

  function saveNamespace() {
    return store.saveCluster(makeCluster(), makeRootMeta())
      .then(cluster => {
        const namespace = makeNamespace({ cluster, });
        return store.saveNamespace(namespace, makeRootMeta());
      });
  }
});
