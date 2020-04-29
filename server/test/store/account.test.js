import expect from 'expect';
import { v4 as uuid } from 'uuid';
import createSystem from '../test-system';
import {
  makeIdentity,
  makeAccount,
  makeRegistry,
  makeTeam,
  makeCluster,
  makeNamespace,
  makeRootMeta,
  makeMeta,
} from '../factories';

describe('Account Store', () => {

  let system = { stop: cb => cb() };
  let store = { nuke: () => {} };

  before(async () => {
    system = createSystem().remove('server');
    ({ store } = await system.start());
  });

  beforeEach(async () => {
    await store.nuke();
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });

  describe('Save Account', () => {

    it('should create an account', async () => {
      const account = await saveAccount();
      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
    });

    it('should permit duplicate display names', async () => {
      const data1 = makeAccount({ displayName: 'John' });
      await saveAccount(data1);

      const data2 = makeAccount({ displayName: 'John' });
      await saveAccount(data2);
    });

  });

  describe('Get Account', () => {

    it('should retrieve account by id', async () => {
      const data = makeAccount({ displayName: 'Foo Bar' });
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
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz' });
      await saveIdentity(saved.id, data);

      const account = await findAccount({ name: 'foo', provider: 'bar', type: 'baz' });
      expect(account).toBeDefined();
      expect(account.id).toBe(saved.id);
    });

    it('should return undefined when identity name not found', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz' });
      await saveIdentity(saved.id, data);

      const account = await findAccount({ name: 'missing', provider: 'bar', type: 'baz' });
      expect(account).toBe(undefined);
    });

    it('should return undefined when provider not found', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz' });
      await saveIdentity(saved.id, data);

      const account = await findAccount({ name: 'foo', provider: 'missing', type: 'baz'});
      expect(account).toBe(undefined);
    });

    it('should return undefined when type not found', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz' });
      await saveIdentity(saved.id, data);

      const account = await findAccount({ name: 'foo', provider: 'bar', type: 'missing'});
      expect(account).toBe(undefined);
    });

    it('should return undefined when account deleted', async () => {
      const saved = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz' });
      await saveIdentity(saved.id, data);
      await deleteAccount(saved.id);

      const account = await findAccount({ identity: 'foo', provider: 'bar', type: 'baz' });
      expect(account).toBe(undefined);
    });

    it('should return undefined when identity and provider were deleted', async () => {
      const savedAccount = await saveAccount();
      const data = makeIdentity({ name: 'foo', provider: 'bar', type: 'baz' });
      const identity = await saveIdentity(savedAccount.id, data);
      await deleteIdentity(identity.id);

      const account = await findAccount({ identity: 'foo', provider: 'bar', type: 'baz' });
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
      const account1Data = makeAccount();
      const identity1Data = makeIdentity();
      const saved = await saveAccount(account1Data);
      await saveIdentity(saved.id, identity1Data);

      const account2Data = makeAccount();
      const identity2Data = makeIdentity();
      const account = await ensureAccount(account2Data, identity2Data);
      expect(account.id).toBeDefined();
      const accountRoles = await store.getRolesForAccount(account.id, account);
      expect(accountRoles).toBeDefined();
      expect(accountRoles.system).toBeDefined();
      expect(accountRoles.system.length).toBe(1);
      expect(accountRoles.system[0]).toMatchObject({ name: 'admin', global: true });
    });

    it('should assign no roles to a new account when there are already active global admins', async () => {
      const account1Data = makeAccount();
      const identity1Data = makeIdentity();
      const saved = await saveAccount(account1Data);
      await saveIdentity(saved.id, identity1Data);
      await grantSystemRole(saved.id, 'admin');
      await grantGlobalRole(saved.id, 'admin');

      const account2Data = makeAccount();
      const identity2Data = makeIdentity();
      const account = await ensureAccount(account2Data, identity2Data);
      expect(account.id).toBeDefined();
      const accountRoles = await store.getRolesForAccount(account.id, account);
      expect(accountRoles.system).toBeDefined();
      expect(accountRoles.system.length).toBe(1);
      expect(accountRoles.system[0]).toMatchObject({ name: 'observer', global: false });
    });

  });

  describe('Find Accounts', () => {

    it('should list accounts, ordered by display name asc', async () => {

      const accounts = [
        {
          data: makeAccount({ displayName: 'c' }),
        },
        {
          data: makeAccount({ displayName: 'a' }),
        },
        {
          data: makeAccount({ displayName: 'b' }),
        },
      ];

      await Promise.all(accounts.map(account => {
        return saveAccount(account.data);
      }));

      const results = await findAccounts();
      expect(results.items.map(a => a.displayName)).toEqual(['a', 'b', 'c', 'root']);
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

    it('should filter by name', async () => {
      await saveAccount(makeAccount({ displayName: 'a' }));
      await saveAccount(makeAccount({ displayName: 'b' }));
      await saveAccount(makeAccount({ displayName: 'ab' }));

      const results = await findAccounts({ filters: { name: [{ value: 'a', exact: false }]}});
      expect(results.count).toBe(2);
    });

    it('should filter by name exactly', async () => {
      await saveAccount(makeAccount({ displayName: 'a' }));
      await saveAccount(makeAccount({ displayName: 'b' }));
      await saveAccount(makeAccount({ displayName: 'ab' }));

      const results = await findAccounts({ filters: { name: [{ value: 'a', exact: true }]}});
      expect(results.count).toBe(1);
    });

    it('should filter by createdBy', async () => {
      const acc = await saveAccount(makeAccount({ displayName: 'a' }));
      const acc2 = await saveAccount(makeAccount({ displayName: 'ab' }), makeMeta({ account: acc }));
      await saveAccount(makeAccount({ displayName: 'b' }), makeMeta({ account: acc }));
      await saveAccount(makeAccount({ displayName: 'abc' }), makeMeta({ account: acc2 }));

      const results = await findAccounts({ filters: { createdBy: [{ value: 'a', exact: false }]}});
      expect(results.count).toBe(3);
    });

    it('should filter by createdBy exactly', async () => {
      const acc = await saveAccount(makeAccount({ displayName: 'a' }));
      const acc2 = await saveAccount(makeAccount({ displayName: 'ab' }), makeMeta({ account: acc }));
      await saveAccount(makeAccount({ displayName: 'b' }), makeMeta({ account: acc }));
      await saveAccount(makeAccount({ displayName: 'abc' }), makeMeta({ account: acc2 }));

      const results = await findAccounts({ filters: { createdBy: [{ value: 'a', exact: true }]}});
      expect(results.count).toBe(2);
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
      const data1 = makeIdentity({ name: 'duplicate-name', provider: 'duplicate-provider', type: 'duplicate-type' });
      const data2 = makeIdentity({ name: 'duplicate-name', provider: 'duplicate-provider', type: 'duplicate-type' });

      await saveIdentity(account1.id, data1);
      await expect(
        saveIdentity(account2.id, data2)
      ).rejects.toHaveProperty('code', '23505');
    });

    it('should permit duplicate identity names for different providers', async () => {
      const account = await saveAccount();
      const data1 = makeIdentity({ name: 'duplidate-name' });
      const data2 = makeIdentity({ name: 'duplidate-name' });

      await saveIdentity(account.id, data1);
      await saveIdentity(account.id, data2);
    });

    it('should permit duplicate providers for an account', async () => {
      const account = await saveAccount();
      const data1 = makeIdentity({ provider: 'duplicate-provider' });
      const data2 = makeIdentity({ provider: 'duplicate-provider' });

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

      await grantSystemRole(saved.id, 'admin');
      const account = await grantGlobalRole(saved.id, 'admin');
      expect(account.id).toBeDefined();
      expect(await store.hasPermissionOnRegistry(saved, '00000000-0000-0000-0000-000000000000', 'registries-write')).toBe(true);
    });

    it('should grant a role on a single registry to an account', async () => {
      const registry = await saveRegistry();
      const saved = await saveAccount();

      const account = await grantRoleOnRegistry(saved.id, 'admin', registry.id);
      expect(account.id).toBeDefined();
      expect(await store.hasPermissionOnRegistry(saved, registry.id, 'registries-write')).toBe(true);
    });

    it('should fail if account does not exist', async () => {
      await expect(
        grantRoleOnRegistry(uuid(), 'admin', '00000000-0000-0000-0000-000000000000')
      ).rejects.toHaveProperty('code', '23503');
    });

    it('should fail if role does not exist', async () => {
      const saved = await saveAccount();
      await expect(
        grantRoleOnRegistry(saved.id, 'missing', '00000000-0000-0000-0000-000000000000')
      ).rejects.toHaveProperty('message', 'Role name missing does not exist.');
    });

    it('should fail if registry does not exist', async () => {
      const saved = await saveAccount();
      await expect(
        grantRoleOnRegistry(saved.id, 'admin', 'missing')
      ).rejects.toHaveProperty('code', '22P02');
    });

    it('should fail if granting user does not have permission to grant', async () => {
      const registry = await saveRegistry();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        grantRoleOnRegistry(saved.id, 'developer', registry.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant registry role developer')
      });
    });

    it('should fail if granting user does not have permission to grant that role', async () => {
      const registry = await saveRegistry();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnRegistry(saved.id, 'admin', registry.id);
      await expect(
        grantRoleOnRegistry(saved.id, 'admin', registry.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant registry role admin')
      });
    });
  });

  describe('Revoke Role On Registry', () => {

    it('should revoke role from account', async () => {
      const saved = await saveAccount();
      const registry = await saveRegistry();
      await grantRoleOnRegistry(saved.id, 'admin', registry.id);
      await revokeRoleOnRegistry(saved.id, 'admin', registry.id);

      const accountRoles = await store.getRolesForAccount(saved.id, saved);
      expect(accountRoles).toBeDefined();
      expect(accountRoles.registries).toBeDefined();
      expect(accountRoles.registries.length).toBe(0);
    });

    it('should tolerate previously revoked role', async () => {
      const account = await saveAccount();
      const registry = await saveRegistry();

      const role = await grantRoleOnRegistry(account.id, 'admin', registry.id);
      await revokeRoleOnRegistry(role.id, 'admin', registry.id);
      await revokeRoleOnRegistry(role.id, 'admin', registry.id);
    });

    it('should fail if revoking user does not have permission to grant', async () => {
      const registry = await saveRegistry();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantRoleOnRegistry(saved.id, 'developer', registry.id);
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        revokeRoleOnRegistry(saved.id, 'developer', registry.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke registry role developer')
      });
    });

    it('should fail if revoking user does not have permission to revoke/grant that role', async () => {
      const registry = await saveRegistry();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnRegistry(saved.id, 'admin', registry.id);
      await expect(
        revokeRoleOnRegistry(saved.id, 'admin', registry.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke registry role admin')
      });
    });
  });

  describe('Grant Role On Namespace', () => {

    it('should grant a role on all namespaces to an account', async () => {
      const namespace = await saveNamespace();
      const saved = await saveAccount();

      await grantSystemRole(saved.id, 'admin');
      const account = await grantGlobalRole(saved.id, 'admin');
      expect(account.id).toBeDefined();
      expect(await store.hasPermissionOnNamespace(saved, namespace.id, 'namespaces-write')).toBe(true);
    });

    it('should grant a role on s single namespace to an account', async () => {
      const namespace = await saveNamespace();
      const saved = await saveAccount();

      const account = await grantRoleOnNamespace(saved.id, 'admin', namespace.id);
      expect(account.id).toBeDefined();
      expect(await store.hasPermissionOnNamespace(saved, namespace.id, 'namespaces-write')).toBe(true);
    });

    it('should fail if account does not exist', async () => {
      const namespace = await saveNamespace();

      await expect(
        grantRoleOnNamespace(uuid(), 'admin', namespace.id)
      ).rejects.toHaveProperty('code', '23503');
    });

    it('should fail if role does not exist', async () => {
      const saved = await saveAccount();
      const namespace = await saveNamespace();

      await expect(
        grantRoleOnNamespace(saved.id, 'missing', namespace.id)
      ).rejects.toHaveProperty('message', 'Role name missing does not exist.');
    });

    it('should fail if namespace does not exist', async () => {
      const saved = await saveAccount();
      await expect(
        grantRoleOnNamespace(saved.id, 'admin', 'missing')
      ).rejects.toHaveProperty('code', '22P02');
    });

    it('should fail if granting user does not have permission to grant', async () => {
      const namespace = await saveNamespace();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        grantRoleOnNamespace(saved.id, 'developer', namespace.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant namespace role developer')
      });
    });

    it('should fail if granting user does not have permission to grant that role', async () => {
      const namespace = await saveNamespace();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnNamespace(saved.id, 'admin', namespace.id);
      await expect(
        grantRoleOnNamespace(saved.id, 'admin', namespace.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant namespace role admin')
      });
    });

  });

  describe('Revoke Role On Namespace', () => {

    it('should revoke role from account', async () => {
      const saved = await saveAccount();
      const namespace = await saveNamespace();
      await grantRoleOnNamespace(saved.id, 'admin', namespace.id);
      await revokeRoleOnNamespace(saved.id, 'admin', namespace.id);

      const accountRoles = await store.getRolesForAccount(saved.id, saved);
      expect(accountRoles).toBeDefined();
      expect(accountRoles.namespaces).toBeDefined();
      expect(accountRoles.namespaces.length).toBe(0);
    });

    it('should tolerate previously revoked role', async () => {
      const account = await saveAccount();
      const namespace = await saveNamespace();

      const role = await grantRoleOnNamespace(account.id, 'admin', namespace.id);
      await revokeRoleOnNamespace(role.id, 'admin', namespace.id);
      await revokeRoleOnNamespace(role.id, 'admin', namespace.id);
    });

    it('should fail if revoking user does not have permission to grant', async () => {
      const namespace = await saveNamespace();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantRoleOnNamespace(saved.id, 'developer', namespace.id);
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        revokeRoleOnNamespace(saved.id, 'developer', namespace.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke namespace role developer')
      });
    });

    it('should fail if revoking user does not have permission to revoke/grant that role', async () => {
      const namespace = await saveNamespace();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnNamespace(saved.id, 'admin', namespace.id);
      await expect(
        revokeRoleOnNamespace(saved.id, 'admin', namespace.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke namespace role admin')
      });
    });
  });

  describe('Grant Role On Team', () => {

    it('should grant a role on all teams to an account', async () => {
      const team = await saveTeam();
      const saved = await saveAccount();

      await grantSystemRole(saved.id, 'admin');
      const account = await grantGlobalRole(saved.id, 'admin');
      expect(account.id).toBeDefined();
      expect(await store.hasPermissionOnTeam(saved, team.id, 'teams-manage')).toBe(true);
    });

    it('should grant a role on a single team to an account', async () => {
      const team = await saveTeam();
      const saved = await saveAccount();

      const account = await grantRoleOnTeam(saved.id, 'admin', team.id);
      expect(account.id).toBeDefined();
      expect(await store.hasPermissionOnTeam(saved, team.id, 'teams-manage')).toBe(true);
    });

    it('should fail if account does not exist', async () => {
      const team = await saveTeam();

      await expect(
        grantRoleOnTeam(uuid(), 'admin', team.id)
      ).rejects.toHaveProperty('code', '23503');
    });

    it('should fail if role does not exist', async () => {
      const saved = await saveAccount();
      const team = await saveTeam();

      await expect(
        grantRoleOnTeam(saved.id, 'missing', team.id)
      ).rejects.toHaveProperty('message', 'Role name missing does not exist.');
    });

    it('should fail if team does not exist', async () => {
      const saved = await saveAccount();
      await expect(
        grantRoleOnTeam(saved.id, 'admin', 'missing')
      ).rejects.toHaveProperty('code', '22P02');
    });

    it('should fail if granting user does not have permission to grant', async () => {
      const team = await saveTeam();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        grantRoleOnTeam(saved.id, 'developer', team.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant team role developer')
      });
    });

    it('should fail if granting user does not have permission to grant that role', async () => {
      const team = await saveTeam();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnTeam(saved.id, 'admin', team.id);
      await expect(
        grantRoleOnTeam(saved.id, 'admin', team.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant team role admin')
      });
    });

  });

  describe('Revoke Role On Team', () => {

    it('should revoke role from account', async () => {
      const saved = await saveAccount();
      const team = await saveTeam();
      await grantRoleOnTeam(saved.id, 'admin', team.id);
      await revokeRoleOnTeam(saved.id, 'admin', team.id);

      const accountRoles = await store.getRolesForAccount(saved.id, saved);
      expect(accountRoles).toBeDefined();
      expect(accountRoles.teams).toBeDefined();
      expect(accountRoles.teams.length).toBe(0);
    });

    it('should tolerate previously revoked role', async () => {
      const account = await saveAccount();
      const team = await saveTeam();

      const role = await grantRoleOnTeam(account.id, 'admin', team.id);
      await revokeRoleOnTeam(role.id, 'admin', team.id);
      await revokeRoleOnTeam(role.id, 'admin', team.id);
    });

    it('should fail if revoking user does not have permission to grant', async () => {
      const team = await saveTeam();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantRoleOnTeam(saved.id, 'developer', team.id);
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        revokeRoleOnTeam(saved.id, 'developer', team.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke team role developer')
      });
    });

    it('should fail if revoking user does not have permission to revoke/grant that role', async () => {
      const team = await saveTeam();
      const saved = await saveAccount();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnTeam(saved.id, 'admin', team.id);
      await expect(
        revokeRoleOnTeam(saved.id, 'admin', team.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke team role admin')
      });
    });
  });

  describe('Namespace roles for a user', () => {
    it('collects role data as seen by global admin', async () => {
      const adminAccount = await saveAccount();
      await grantSystemRole(adminAccount.id, 'admin');
      await grantGlobalRole(adminAccount.id, 'admin');
      const genericAccount = await saveAccount();
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();

      await grantRoleOnNamespace(genericAccount.id, 'developer', namespace.id);
      await grantRoleOnNamespace(genericAccount.id, 'observer', namespace2.id);

      const result = await store.rolesForNamespaces(genericAccount.id, adminAccount);
      const { currentRoles, namespacesWithoutRoles, rolesGrantable } = result;

      expect(namespacesWithoutRoles.length).toBe(0);

      expect(currentRoles.length).toBe(2);
      expect(currentRoles.find(({ namespace: { id } }) => id === namespace.id).roles).toMatchObject(['developer']);
      expect(currentRoles.find(({ namespace: { id } }) => id === namespace2.id).roles).toMatchObject(['observer']);

      expect(rolesGrantable.length).toBe(2);
      const namespaceGrantable = rolesGrantable.find(({ id }) => id === namespace.id);
      expect(namespaceGrantable).toBeDefined();
      expect(namespaceGrantable.roles.length).toBe(4);
      expect(namespaceGrantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
      const namespace2Grantable = rolesGrantable.find(({ id }) => id === namespace2.id);
      expect(namespace2Grantable).toBeDefined();
      expect(namespace2Grantable.roles.length).toBe(4);
      expect(namespace2Grantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
    });

    it('collects role data as seen by an admin of namespaces', async () => {
      const adminAccount = await saveAccount();
      const genericAccount = await saveAccount();
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();

      await grantRoleOnNamespace(adminAccount.id, 'admin', namespace.id);
      await grantRoleOnNamespace(adminAccount.id, 'admin', namespace2.id);
      await grantRoleOnNamespace(genericAccount.id, 'developer', namespace.id);
      await grantRoleOnNamespace(genericAccount.id, 'observer', namespace2.id);

      const result = await store.rolesForNamespaces(genericAccount.id, adminAccount);
      const { currentRoles, namespacesWithoutRoles, rolesGrantable } = result;

      expect(namespacesWithoutRoles.length).toBe(0);

      expect(currentRoles.length).toBe(2);
      expect(currentRoles.find(({ namespace: { id } }) => id === namespace.id).roles).toMatchObject(['developer']);
      expect(currentRoles.find(({ namespace: { id } }) => id === namespace2.id).roles).toMatchObject(['observer']);

      expect(rolesGrantable.length).toBe(2);
      const namespaceGrantable = rolesGrantable.find(({ id }) => id === namespace.id);
      expect(namespaceGrantable).toBeDefined();
      expect(namespaceGrantable.roles.length).toBe(4);
      expect(namespaceGrantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
      const namespace2Grantable = rolesGrantable.find(({ id }) => id === namespace2.id);
      expect(namespace2Grantable).toBeDefined();
      expect(namespace2Grantable.roles.length).toBe(4);
      expect(namespace2Grantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
    });

    it('collects role data for only what a user can see', async () => {
      const adminAccount = await saveAccount();
      const genericAccount = await saveAccount();
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();

      await grantRoleOnNamespace(adminAccount.id, 'admin', namespace.id);
      await grantRoleOnNamespace(genericAccount.id, 'developer', namespace.id);
      await grantRoleOnNamespace(genericAccount.id, 'observer', namespace2.id);

      const result = await store.rolesForNamespaces(genericAccount.id, adminAccount);
      const { currentRoles, namespacesWithoutRoles, rolesGrantable } = result;

      expect(namespacesWithoutRoles.length).toBe(0);

      expect(currentRoles.length).toBe(1);
      expect(currentRoles.find(({ namespace: { id } }) => id === namespace.id).roles).toMatchObject(['developer']);

      expect(rolesGrantable.length).toBe(1);
      const namespaceGrantable = rolesGrantable.find(({ id }) => id === namespace.id);
      expect(namespaceGrantable).toBeDefined();
      expect(namespaceGrantable.roles.length).toBe(4);
      expect(namespaceGrantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
    });

    it('provides role data for namespaces visible to user, not granted to subject user', async () => {
      const adminAccount = await saveAccount();
      const genericAccount = await saveAccount();
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();

      await grantRoleOnNamespace(adminAccount.id, 'admin', namespace.id);
      await grantRoleOnNamespace(adminAccount.id, 'maintainer', namespace2.id);
      await grantRoleOnNamespace(genericAccount.id, 'developer', namespace.id);

      const result = await store.rolesForNamespaces(genericAccount.id, adminAccount);
      const { currentRoles, namespacesWithoutRoles, rolesGrantable } = result;

      expect(namespacesWithoutRoles.length).toBe(1);
      expect(namespacesWithoutRoles[0].id).toBe(namespace2.id);

      expect(currentRoles.length).toBe(1);
      expect(currentRoles.find(({ namespace: { id } }) => id === namespace.id).roles).toMatchObject(['developer']);

      expect(rolesGrantable.length).toBe(2);
      const namespaceGrantable = rolesGrantable.find(({ id }) => id === namespace.id);
      expect(namespaceGrantable).toBeDefined();
      expect(namespaceGrantable.roles.length).toBe(4);
      expect(namespaceGrantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
      const namespace2Grantable = rolesGrantable.find(({ id }) => id === namespace2.id);
      expect(namespace2Grantable).toBeDefined();
      expect(namespace2Grantable.roles.length).toBe(3);
      expect(namespace2Grantable.roles).toMatchObject(['developer', 'maintainer', 'observer']);
    });

    it('if you do not have the permissions, you do not see roles available to grant', async () => {
      const adminAccount = await saveAccount();
      const genericAccount = await saveAccount();
      const namespace = await saveNamespace();
      await saveNamespace();

      await grantSystemRole(adminAccount.id, 'developer');
      await grantGlobalRole(adminAccount.id, 'developer');
      await grantRoleOnNamespace(genericAccount.id, 'developer', namespace.id);

      const result = await store.rolesForNamespaces(genericAccount.id, adminAccount);
      const { currentRoles, namespacesWithoutRoles, rolesGrantable } = result;

      expect(namespacesWithoutRoles.length).toBe(0);

      expect(currentRoles.length).toBe(1);
      expect(currentRoles.find(({ namespace: { id } }) => id === namespace.id).roles).toMatchObject(['developer']);

      expect(rolesGrantable.length).toBe(0);
    });
  });

  describe('Registry roles for a user', () => {
    it('collects role data as seen by global admin', async () => {
      const adminAccount = await saveAccount();
      await grantSystemRole(adminAccount.id, 'admin');
      await grantGlobalRole(adminAccount.id, 'admin');
      const genericAccount = await saveAccount();
      const registry = await saveRegistry();
      const registry2 = await saveRegistry();

      await grantRoleOnRegistry(genericAccount.id, 'developer', registry.id);
      await grantRoleOnRegistry(genericAccount.id, 'observer', registry2.id);

      const result = await store.rolesForRegistries(genericAccount.id, adminAccount);
      const { currentRoles, registriesWithoutRoles, rolesGrantable } = result;

      expect(registriesWithoutRoles.length).toBe(1);

      expect(currentRoles.length).toBe(2);
      expect(currentRoles.find(({ registry: { id } }) => id === registry.id).roles).toMatchObject(['developer']);
      expect(currentRoles.find(({ registry: { id } }) => id === registry2.id).roles).toMatchObject(['observer']);

      expect(rolesGrantable.length).toBe(3);
      const registryGrantable = rolesGrantable.find(({ id }) => id === registry.id);
      expect(registryGrantable).toBeDefined();
      expect(registryGrantable.roles.length).toBe(4);
      expect(registryGrantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
      const registry2Grantable = rolesGrantable.find(({ id }) => id === registry2.id);
      expect(registry2Grantable).toBeDefined();
      expect(registry2Grantable.roles.length).toBe(4);
      expect(registry2Grantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
    });

    it('collects role data as seen by an admin of registries', async () => {
      const adminAccount = await saveAccount();
      const genericAccount = await saveAccount();
      const registry = await saveRegistry();
      const registry2 = await saveRegistry();

      await grantRoleOnRegistry(adminAccount.id, 'admin', registry.id);
      await grantRoleOnRegistry(adminAccount.id, 'admin', registry2.id);
      await grantRoleOnRegistry(genericAccount.id, 'developer', registry.id);
      await grantRoleOnRegistry(genericAccount.id, 'observer', registry2.id);

      const result = await store.rolesForRegistries(genericAccount.id, adminAccount);
      const { currentRoles, registriesWithoutRoles, rolesGrantable } = result;

      expect(registriesWithoutRoles.length).toBe(0);

      expect(currentRoles.length).toBe(2);
      expect(currentRoles.find(({ registry: { id } }) => id === registry.id).roles).toMatchObject(['developer']);
      expect(currentRoles.find(({ registry: { id } }) => id === registry2.id).roles).toMatchObject(['observer']);

      expect(rolesGrantable.length).toBe(2);
      const registryGrantable = rolesGrantable.find(({ id }) => id === registry.id);
      expect(registryGrantable).toBeDefined();
      expect(registryGrantable.roles.length).toBe(4);
      expect(registryGrantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
      const registry2Grantable = rolesGrantable.find(({ id }) => id === registry2.id);
      expect(registry2Grantable).toBeDefined();
      expect(registry2Grantable.roles.length).toBe(4);
      expect(registry2Grantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
    });

    it('collects role data for only what a user can see', async () => {
      const adminAccount = await saveAccount();
      const genericAccount = await saveAccount();
      const registry = await saveRegistry();
      const registry2 = await saveRegistry();

      await grantRoleOnRegistry(adminAccount.id, 'admin', registry.id);
      await grantRoleOnRegistry(genericAccount.id, 'developer', registry.id);
      await grantRoleOnRegistry(genericAccount.id, 'observer', registry2.id);

      const result = await store.rolesForRegistries(genericAccount.id, adminAccount);
      const { currentRoles, registriesWithoutRoles, rolesGrantable } = result;

      expect(registriesWithoutRoles.length).toBe(0);

      expect(currentRoles.length).toBe(1);
      expect(currentRoles.find(({ registry: { id } }) => id === registry.id).roles).toMatchObject(['developer']);

      expect(rolesGrantable.length).toBe(1);
      const registryGrantable = rolesGrantable.find(({ id }) => id === registry.id);
      expect(registryGrantable).toBeDefined();
      expect(registryGrantable.roles.length).toBe(4);
      expect(registryGrantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
    });

    it('provides role data for registries visible to user, not granted to subject user', async () => {
      const adminAccount = await saveAccount();
      const genericAccount = await saveAccount();
      const registry = await saveRegistry();
      const registry2 = await saveRegistry();

      await grantRoleOnRegistry(adminAccount.id, 'admin', registry.id);
      await grantRoleOnRegistry(adminAccount.id, 'maintainer', registry2.id);
      await grantRoleOnRegistry(genericAccount.id, 'developer', registry.id);

      const result = await store.rolesForRegistries(genericAccount.id, adminAccount);
      const { currentRoles, registriesWithoutRoles, rolesGrantable } = result;

      expect(registriesWithoutRoles.length).toBe(1);
      expect(registriesWithoutRoles[0].id).toBe(registry2.id);

      expect(currentRoles.length).toBe(1);
      expect(currentRoles.find(({ registry: { id } }) => id === registry.id).roles).toMatchObject(['developer']);

      expect(rolesGrantable.length).toBe(2);
      const registryGrantable = rolesGrantable.find(({ id }) => id === registry.id);
      expect(registryGrantable).toBeDefined();
      expect(registryGrantable.roles.length).toBe(4);
      expect(registryGrantable.roles).toMatchObject(['admin', 'developer', 'maintainer', 'observer']);
      const registry2Grantable = rolesGrantable.find(({ id }) => id === registry2.id);
      expect(registry2Grantable).toBeDefined();
      expect(registry2Grantable.roles.length).toBe(3);
      expect(registry2Grantable.roles).toMatchObject(['developer', 'maintainer', 'observer']);
    });

    it('if you do not have the permissions, you do not see roles available to grant', async () => {
      const adminAccount = await saveAccount();
      const genericAccount = await saveAccount();
      const registry = await saveRegistry();
      await saveRegistry();

      await grantSystemRole(adminAccount.id, 'developer');
      await grantGlobalRole(adminAccount.id, 'developer');
      await grantRoleOnRegistry(genericAccount.id, 'developer', registry.id);

      const result = await store.rolesForRegistries(genericAccount.id, adminAccount);
      const { currentRoles, registriesWithoutRoles, rolesGrantable } = result;

      expect(registriesWithoutRoles.length).toBe(0);

      expect(currentRoles.length).toBe(1);
      expect(currentRoles.find(({ registry: { id } }) => id === registry.id).roles).toMatchObject(['developer']);

      expect(rolesGrantable.length).toBe(0);
    });
  });

  describe('System roles', () => {
    it('grants global role from global admin', async () => {
      const adminAccount = await saveAccount();
      await grantSystemRole(adminAccount.id, 'admin');
      await grantGlobalRole(adminAccount.id, 'admin');
      const genericAccount = await saveAccount();
      await grantSystemRole(genericAccount.id, 'developer', makeMeta({ account: adminAccount }));
      await grantGlobalRole(genericAccount.id, 'developer', makeMeta({ account: adminAccount }));


      const result = await store.rolesForSystem(genericAccount.id, adminAccount);
      const { currentRoles } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: true });
    });

    it('does not allow global changes to self', async () => {
      const adminAccount = await saveAccount();
      await grantSystemRole(adminAccount.id, 'admin');
      await grantGlobalRole(adminAccount.id, 'admin');

      const result = await store.rolesForSystem(adminAccount.id, adminAccount);
      const { globalGrantable } = result;

      expect(globalGrantable.length).toBe(0);
    });

    it('revokes global role as global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');
      await grantGlobalRole(maintainerAccount.id, 'maintainer');
      const genericAccount = await saveAccount();
      await grantSystemRole(genericAccount.id, 'developer');
      await grantGlobalRole(genericAccount.id, 'developer');
      await revokeGlobalRole(genericAccount.id, 'developer', makeMeta({ account: maintainerAccount }));


      const result = await store.rolesForSystem(genericAccount.id, maintainerAccount);
      const { currentRoles } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: false });
    });

    it('cannot revoke global role from non global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');

      const genericAccount = await saveAccount();
      await grantSystemRole(genericAccount.id, 'developer');
      await grantGlobalRole(genericAccount.id, 'developer');

      await expect(
        revokeGlobalRole(genericAccount.id, 'developer', makeMeta({ account: maintainerAccount }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke global role developer')
      });
    });

    it('grants global role from global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');
      await grantGlobalRole(maintainerAccount.id, 'maintainer');
      const genericAccount = await saveAccount();
      await grantSystemRole(genericAccount.id, 'developer', makeMeta({ account: maintainerAccount }));
      await grantGlobalRole(genericAccount.id, 'developer', makeMeta({ account: maintainerAccount }));


      const result = await store.rolesForSystem(genericAccount.id, maintainerAccount);
      const { currentRoles } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: true });
    });

    it('cannot grant global role from non global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');

      const genericAccount = await saveAccount();
      await grantSystemRole(genericAccount.id, 'developer');

      await expect(
        grantGlobalRole(genericAccount.id, 'developer', makeMeta({ account: maintainerAccount }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant global role developer')
      });
    });

    it('collects role data as seen by global admin', async () => {
      const adminAccount = await saveAccount();
      await grantSystemRole(adminAccount.id, 'admin');
      await grantGlobalRole(adminAccount.id, 'admin');
      const genericAccount = await saveAccount();
      await grantSystemRole(genericAccount.id, 'developer');


      const result = await store.rolesForSystem(genericAccount.id, adminAccount);
      const { currentRoles, rolesGrantable, globalGrantable } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: false });

      expect(rolesGrantable.length).toBe(4);
      expect(rolesGrantable).toMatchObject(['admin', 'maintainer', 'developer', 'observer']);

      expect(globalGrantable.length).toBe(4);
      expect(globalGrantable).toMatchObject(['admin', 'maintainer', 'developer', 'observer']);
    });

    it('collects role data as seen by global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');
      await grantGlobalRole(maintainerAccount.id, 'maintainer');
      const genericAccount = await saveAccount();
      await grantSystemRole(genericAccount.id, 'developer');


      const result = await store.rolesForSystem(genericAccount.id, maintainerAccount);
      const { currentRoles, rolesGrantable, globalGrantable } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: false });

      expect(rolesGrantable.length).toBe(3);
      expect(rolesGrantable).toMatchObject(['maintainer', 'developer', 'observer']);

      expect(globalGrantable.length).toBe(3);
      expect(globalGrantable).toMatchObject(['maintainer', 'developer', 'observer']);
    });

    it('collects role data as seen by maintainer without global', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');
      // await grantGlobalRole(maintainerAccount.id, 'admin');
      const genericAccount = await saveAccount();
      await grantSystemRole(genericAccount.id, 'developer');


      const result = await store.rolesForSystem(genericAccount.id, maintainerAccount);
      const { currentRoles, rolesGrantable, globalGrantable } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: false });

      expect(rolesGrantable.length).toBe(3);
      expect(rolesGrantable).toMatchObject(['maintainer', 'developer', 'observer']);

      expect(globalGrantable.length).toBe(0);
      expect(globalGrantable).toMatchObject([]);
    });
  });

  function saveRegistry(registry = makeRegistry(), meta = makeRootMeta() ) {
    return store.saveRegistry(registry, meta);
  }

  function saveAccount(account = makeAccount(), meta = makeRootMeta() ) {
    return store.saveAccount(account, meta);
  }

  function ensureAccount(account = makeAccount(), identity = makeIdentity(), meta = makeRootMeta() ) {
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

  function deleteAccount(id, meta = makeRootMeta() ) {
    return store.deleteAccount(id, meta);
  }

  function saveIdentity(accountId, identity = makeIdentity(), meta = makeRootMeta() ) {
    return store.saveIdentity(accountId, identity, meta);
  }

  function deleteIdentity(id, meta = makeRootMeta() ) {
    return store.deleteIdentity(id, meta);
  }

  function grantRoleOnRegistry(id, name, registry, meta = makeRootMeta() ) {
    return store.grantRoleOnRegistry(id, name, registry, meta);
  }

  function revokeRoleOnRegistry(accountId, roleName, registryId, meta = makeRootMeta() ) {
    return store.revokeRoleOnRegistry(accountId, roleName, registryId, meta);
  }

  function grantRoleOnTeam(id, name, team, meta = makeRootMeta() ) {
    return store.grantRoleOnTeam(id, name, team, meta);
  }

  function revokeRoleOnTeam(accountId, roleName, teamId, meta = makeRootMeta() ) {
    return store.revokeRoleOnTeam(accountId, roleName, teamId, meta);
  }

  function grantRoleOnNamespace(id, name, namespace, meta = makeRootMeta() ) {
    return store.grantRoleOnNamespace(id, name, namespace, meta);
  }

  function revokeRoleOnNamespace(accountId, roleName, namespaceId, meta = makeRootMeta() ) {
    return store.revokeRoleOnNamespace(accountId, roleName, namespaceId, meta);
  }

  function grantGlobalRole(accountId, roleName, meta = makeRootMeta()) {
    return store.grantGlobalRole(accountId, roleName, meta);
  }

  function revokeGlobalRole(accountId, roleName, meta = makeRootMeta()) {
    return store.revokeGlobalRole(accountId, roleName, meta);
  }

  function grantSystemRole(accountId, roleName, meta = makeRootMeta()) {
    return store.grantSystemRole(accountId, roleName, meta);
  }

  function saveNamespace() {
    return store.saveCluster(makeCluster(), makeRootMeta())
      .then(cluster => {
        const namespace = makeNamespace({ cluster });
        return store.saveNamespace(namespace, makeRootMeta());
      });
  }

  async function saveTeam(team = makeTeam(), meta = makeRootMeta()) {
    return store.getTeam(await store.saveTeam(team, meta));
  }
});
