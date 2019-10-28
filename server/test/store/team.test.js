import expect from 'expect';
import { v4 as uuid } from 'uuid';
import createSystem from '../test-system';
import {
  makeService,
  makeRelease,
  makeRootMeta,
  makeAccount,
  makeRegistry,
  makeNamespace,
  makeCluster,
  makeTeam,
  makeMeta,
} from '../factories';

describe('Team store', () => {
  let system = { stop: cb => cb() };
  let store = { nuke: () => new Promise(cb => cb()) };

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

  describe('Saving', () => {
      it('saves a team and gets it by id', async () => {
        const id = await saveTeam(makeTeam({
          name: 'A team name',
          attributes: {
            abc: 'def',
            xyz: 'abc',
          },
        }));

        const team = await store.getTeam(id);
        expect(team.name).toBe('A team name');
        expect(team.attributes).toMatchObject({
          abc: 'def',
          xyz: 'abc',
        });
      });
  });

  describe('findTeams', () => {
    it('should find all teams', async () => {
      await saveTeam(makeTeam({ name: 'engineers' }));
      await saveTeam(makeTeam({ name: 'mentors', attributes: { abc: 123 } }));

      const results = await store.findTeams();
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2
      });
      expect(results.items[0].name).toBe('engineers');
      expect(results.items[1].name).toBe('mentors');
      expect(results.items[1].attributes).toMatchObject({
        abc: '123',
      });
    });
  });

  describe('service association', () => {
    it('associates a service with a team', async () => {
      const service = await saveService(makeService({ name: 'app-1' }));
      const service2 = await saveService(makeService({ name: 'app-2' }));
      await saveService(makeService({ name: 'not-associated' }));
      const team = await store.getTeam(await saveTeam());

      await associateServiceWithTeam(service, team);
      await associateServiceWithTeam(service2, team);

      const result = await store.findServices({ team });

      expect(result).toBeDefined();
      expect(result.count).toBe(2);
      expect(result.items).toMatchObject([
        {
          name: 'app-1'
        },
        {
          name: 'app-2'
        }
      ]);
    });

    it('re-associates a service with another team', async () => {
      const service = await saveService(makeService({ name: 'app-1' }));
      const service2 = await saveService(makeService({ name: 'app-2' }));
      const team = await store.getTeam(await saveTeam());
      const team2 = await store.getTeam(await saveTeam());

      await associateServiceWithTeam(service, team);
      await associateServiceWithTeam(service2, team);

      const result = await store.findServices({ team });
      expect(result.items).toMatchObject([
        {
          name: 'app-1'
        },
        {
          name: 'app-2'
        }
      ]);

      await associateServiceWithTeam(service2, team2);
      const results = [await store.findServices({ team }), await store.findServices({ team: team2 })];
      expect(results[0]).toBeDefined();
      expect(results[0].count).toBe(1);
      expect(results[0].items).toMatchObject([
        {
          name: 'app-1'
        }
      ]);
      expect(results[1]).toBeDefined();
      expect(results[1].count).toBe(1);
      expect(results[1].items).toMatchObject([
        {
          name: 'app-2'
        }
      ]);
    });

    it('disassociates a service from a team', async () => {
      const service = await saveService();
      const team = await store.getTeam(await saveTeam());

      await associateServiceWithTeam(service, team);
      expect((await store.findServices({ team })).count).toBe(1);

      await store.disassociateService(service);
      expect((await store.findServices({ team })).count).toBe(0);
    });

    it('retrieves a team for a given service that it is associated with it', async () => {
      const service = await saveService();
      const team = await store.getTeam(await saveTeam());

      await associateServiceWithTeam(service, team);

      const result = await store.getTeamForService(service);
      expect(result).toBeDefined();
      expect(result.id).toBe(team.id);
    });
  });

  describe('Grant Role On Registry', () => {

    it('should grant a role on all registries to a team', async () => {
      const account = await saveAccount();
      const saved = await getTeam(await saveTeam());
      await associateAccountWithTeam(account, saved);

      await grantSystemRoleOnTeam(saved.id, 'admin');
      const team = await grantGlobalRoleOnTeam(saved.id, 'admin');
      expect(team.id).toBeDefined();
      expect(await store.hasPermissionOnRegistry(account, '00000000-0000-0000-0000-000000000000', 'registries-write')).toBe(true);
    });

    it('should grant a role on a single registry to a team', async () => {
      const registry = await saveRegistry();
      const account = await saveAccount();
      const saved = await getTeam(await saveTeam());
      await associateAccountWithTeam(account, saved);

      const team = await grantRoleOnRegistryOnTeam(saved.id, 'admin', registry.id);
      expect(team.id).toBeDefined();
      expect(await store.hasPermissionOnRegistry(account, registry.id, 'registries-write')).toBe(true);
    });

    it('should fail if team does not exist', async () => {
      await expect(
        grantRoleOnRegistryOnTeam(uuid(), 'admin', '00000000-0000-0000-0000-000000000000')
      ).rejects.toHaveProperty('code', '23503');
    });

    it('should fail if role does not exist', async () => {
      const saved = await saveTeam();
      await expect(
        grantRoleOnRegistryOnTeam(saved, 'missing', '00000000-0000-0000-0000-000000000000')
      ).rejects.toHaveProperty('message', 'Role name missing does not exist.');
    });

    it('should fail if registry does not exist', async () => {
      const saved = await saveTeam();
      await expect(
        grantRoleOnRegistryOnTeam(saved, 'admin', 'missing')
      ).rejects.toHaveProperty('code', '22P02');
    });

    it('should fail if granting user does not have permission to grant', async () => {
      const registry = await saveRegistry();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        grantRoleOnRegistryOnTeam(saved, 'developer', registry.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant registry role developer')
      });
    });

    it('should fail if granting user does not have permission to grant that role', async () => {
      const registry = await saveRegistry();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');

      await expect(
        grantRoleOnRegistryOnTeam(saved, 'admin', registry.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant registry role admin')
      });
    });
  });

  describe('Revoke Role On Registry', () => {

    it('should revoke role from team', async () => {
      const account = await saveAccount();
      const saved = await saveTeam();
      const registry = await saveRegistry();
      await associateAccountWithTeam(account, { id: saved });

      await grantRoleOnRegistryOnTeam(saved, 'admin', registry.id);
      await revokeRoleOnRegistryFromTeam(saved, 'admin', registry.id);

      expect(await store.hasPermissionOnRegistry(account, registry.id, 'registries-write')).toBe(false);
    });

    it('should tolerate previously revoked role', async () => {
      const team = await saveTeam();
      const registry = await saveRegistry();

      const role = await grantRoleOnRegistryOnTeam(team, 'admin', registry.id);
      await revokeRoleOnRegistryFromTeam(role.id, 'admin', registry.id);
      await revokeRoleOnRegistryFromTeam(role.id, 'admin', registry.id);
    });

    it('should fail if revoking user does not have permission to grant', async () => {
      const registry = await saveRegistry();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantRoleOnRegistryOnTeam(saved, 'developer', registry.id);
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        revokeRoleOnRegistryFromTeam(saved, 'developer', registry.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke registry role developer')
      });
    });

    it('should fail if revoking user does not have permission to revoke/grant that role', async () => {
      const registry = await saveRegistry();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnRegistryOnTeam(saved, 'admin', registry.id);
      await expect(
        revokeRoleOnRegistryFromTeam(saved, 'admin', registry.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke registry role admin')
      });
    });
  });

  describe('Grant Role On Namespace', () => {

    it('should grant a role on all namespaces to a team', async () => {
      const account = await saveAccount();
      const namespace = await saveNamespace();
      const saved = await getTeam(await saveTeam());
      await associateAccountWithTeam(account, saved);

      await grantSystemRoleOnTeam(saved.id, 'admin');
      const team = await grantGlobalRoleOnTeam(saved.id, 'admin');
      expect(team.id).toBeDefined();
      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-write')).toBe(true);
    });

    it('should grant a role on a single namespace to a team', async () => {
      const namespace = await saveNamespace();
      const account = await saveAccount();
      const saved = await getTeam(await saveTeam());
      await associateAccountWithTeam(account, saved);

      const team = await grantRoleOnNamespaceOnTeam(saved.id, 'admin', namespace.id);
      expect(team.id).toBeDefined();
      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-write')).toBe(true);
    });

    it('should fail if team does not exist', async () => {
      const namespace = await saveNamespace();

      await expect(
        grantRoleOnNamespaceOnTeam(uuid(), 'admin', namespace.id)
      ).rejects.toHaveProperty('code', '23503');
    });

    it('should fail if role does not exist', async () => {
      const saved = await saveTeam();
      const namespace = await saveNamespace();

      await expect(
        grantRoleOnNamespaceOnTeam(saved.id, 'missing', namespace.id)
      ).rejects.toHaveProperty('message', 'Role name missing does not exist.');
    });

    it('should fail if namespace does not exist', async () => {
      const saved = await saveTeam();
      await expect(
        grantRoleOnNamespaceOnTeam(saved.id, 'admin', 'missing')
      ).rejects.toHaveProperty('code', '22P02');
    });

    it('should fail if granting user does not have permission to grant', async () => {
      const namespace = await saveNamespace();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        grantRoleOnNamespaceOnTeam(saved, 'developer', namespace.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant namespace role developer')
      });
    });

    it('should fail if granting user does not have permission to grant that role', async () => {
      const namespace = await saveNamespace();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnNamespaceOnTeam(saved, 'admin', namespace.id);
      await expect(
        grantRoleOnNamespaceOnTeam(saved.id, 'admin', namespace.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant namespace role admin')
      });
    });

  });

  describe('Revoke Role On Namespace', () => {

    it('should revoke role from team', async () => {
      const account = await saveAccount();
      const saved = await saveTeam();
      const namespace = await saveNamespace();
      await associateAccountWithTeam(account, { id: saved });

      await grantRoleOnNamespaceOnTeam(saved, 'admin', namespace.id);
      await revokeRoleOnNamespaceFromTeam(saved, 'admin', namespace.id);

      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-write')).toBe(false);
    });

    it('should tolerate previously revoked role', async () => {
      const saved = await saveTeam();
      const namespace = await saveNamespace();

      const role = await grantRoleOnNamespaceOnTeam(saved, 'admin', namespace.id);
      await revokeRoleOnNamespaceFromTeam(role.id, 'admin', namespace.id);
      await revokeRoleOnNamespaceFromTeam(role.id, 'admin', namespace.id);
    });

    it('should fail if revoking user does not have permission to grant', async () => {
      const namespace = await saveNamespace();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantRoleOnNamespaceOnTeam(saved, 'developer', namespace.id);
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        revokeRoleOnNamespaceFromTeam(saved, 'developer', namespace.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke namespace role developer')
      });
    });

    it('should fail if revoking user does not have permission to revoke/grant that role', async () => {
      const namespace = await saveNamespace();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnNamespaceOnTeam(saved, 'admin', namespace.id);
      await expect(
        revokeRoleOnNamespaceFromTeam(saved, 'admin', namespace.id, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke namespace role admin')
      });
    });
  });

  describe('Grant Role On Team', () => {

    it('should grant a role on all teams to a team', async () => {
      const team = await saveTeam();
      const saved = await saveTeam();
      const account = await saveAccount();
      await associateAccountWithTeam(account, { id: saved });

      await grantSystemRoleOnTeam(saved, 'admin');
      await grantGlobalRoleOnTeam(saved, 'admin');

      expect(await store.hasPermissionOnTeam(account, team.id, 'teams-manage')).toBe(true);
    });

    it('should grant a role on a single team to a team', async () => {
      const subjectTeam = await saveTeam();
      const saved = await saveTeam();
      const account = await saveAccount();
      await associateAccountWithTeam(account, { id: saved });

      await grantRoleOnTeamForTeam(saved, 'admin', subjectTeam);
      expect(await store.hasPermissionOnTeam(account, subjectTeam, 'teams-manage')).toBe(true);
    });

    it('should fail if account does not exist', async () => {
      const team = await saveTeam();

      await expect(
        grantRoleOnTeamForTeam(uuid(), 'admin', team)
      ).rejects.toHaveProperty('code', '23503');
    });

    it('should fail if role does not exist', async () => {
      const saved = await saveTeam();
      const subjectTeam = await saveTeam();

      await expect(
        grantRoleOnTeamForTeam(saved, 'missing', subjectTeam)
      ).rejects.toHaveProperty('message', 'Role name missing does not exist.');
    });

    it('should fail if team does not exist', async () => {
      const saved = await saveTeam();
      await expect(
        grantRoleOnTeamForTeam(saved.id, 'admin', 'missing')
      ).rejects.toHaveProperty('code', '22P02');
    });

    it('should fail if granting user does not have permission to grant', async () => {
      const subjectTeam = await saveTeam();
      const saved = await saveTeam();
      const granting = await saveAccount();

      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        grantRoleOnTeamForTeam(saved, 'developer', subjectTeam, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant team role developer')
      });
    });

    it('should fail if granting user does not have permission to grant that role', async () => {
      const subjectTeam = await saveTeam();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnTeamForTeam(saved, 'admin', subjectTeam);
      await expect(
        grantRoleOnTeamForTeam(saved, 'admin', subjectTeam, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant team role admin')
      });
    });

  });

  describe('Revoke Role On Team', () => {

    it('should revoke role from account', async () => {
      const account = await saveAccount();
      const saved = await saveTeam();
      const subjectTeam = await saveTeam();

      await associateAccountWithTeam(account, { id: saved });
      await grantRoleOnTeamForTeam(saved, 'admin', subjectTeam);
      await revokeRoleOnTeamFromTeam(saved, 'admin', subjectTeam);

      expect(await store.hasPermissionOnTeam(account, subjectTeam, 'teams-manage')).toBe(false);
    });

    it('should tolerate previously revoked role', async () => {
      const subjectTeam = await saveTeam();
      const team = await saveTeam();

      await grantRoleOnTeamForTeam(team, 'admin', subjectTeam);
      await revokeRoleOnTeamFromTeam(team, 'admin', subjectTeam);
      await revokeRoleOnTeamFromTeam(team, 'admin', subjectTeam);
    });

    it('should fail if revoking user does not have permission to grant', async () => {
      const subjectTeam = await saveTeam();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantRoleOnTeamForTeam(saved, 'developer', subjectTeam);
      await grantSystemRole(granting.id, 'developer');
      await grantGlobalRole(granting.id, 'developer');
      await expect(
        revokeRoleOnTeamFromTeam(saved, 'developer', subjectTeam, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke team role developer')
      });
    });

    it('should fail if revoking user does not have permission to revoke/grant that role', async () => {
      const subjectTeam = await saveTeam();
      const saved = await saveTeam();
      const granting = await saveAccount();
      await grantSystemRole(granting.id, 'maintainer');
      await grantGlobalRole(granting.id, 'maintainer');
      await grantRoleOnTeamForTeam(saved, 'admin', subjectTeam);
      await expect(
        revokeRoleOnTeamFromTeam(saved, 'admin', subjectTeam, makeMeta({ account: granting }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke team role admin')
      });
    });
  });

  describe('Namespace roles for a team', () => {
    it('collects role data as seen by global admin', async () => {
      const adminAccount = await saveAccount();
      await grantSystemRole(adminAccount.id, 'admin');
      await grantGlobalRole(adminAccount.id, 'admin');
      const team = await saveTeam();
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();

      await grantRoleOnNamespaceOnTeam(team, 'developer', namespace.id);
      await grantRoleOnNamespaceOnTeam(team, 'observer', namespace2.id);

      const result = await store.teamRolesForNamespaces(team, adminAccount);
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
      const team = await saveTeam();
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();

      await grantRoleOnNamespace(adminAccount.id, 'admin', namespace.id);
      await grantRoleOnNamespace(adminAccount.id, 'admin', namespace2.id);
      await grantRoleOnNamespaceOnTeam(team, 'developer', namespace.id);
      await grantRoleOnNamespaceOnTeam(team, 'observer', namespace2.id);

      const result = await store.teamRolesForNamespaces(team, adminAccount);
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
      const team = await saveTeam();
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();

      await grantRoleOnNamespace(adminAccount.id, 'admin', namespace.id);
      await grantRoleOnNamespaceOnTeam(team, 'developer', namespace.id);
      await grantRoleOnNamespaceOnTeam(team, 'observer', namespace2.id);

      const result = await store.teamRolesForNamespaces(team, adminAccount);
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

    it('provides role data for namespaces visible to user, not granted to subject team', async () => {
      const adminAccount = await saveAccount();
      const team = await saveTeam();
      const namespace = await saveNamespace();
      const namespace2 = await saveNamespace();

      await grantRoleOnNamespace(adminAccount.id, 'admin', namespace.id);
      await grantRoleOnNamespace(adminAccount.id, 'maintainer', namespace2.id);
      await grantRoleOnNamespaceOnTeam(team, 'developer', namespace.id);

      const result = await store.teamRolesForNamespaces(team, adminAccount);
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
      const team = await saveTeam();
      const namespace = await saveNamespace();
      await saveNamespace();

      await grantSystemRole(adminAccount.id, 'developer');
      await grantGlobalRole(adminAccount.id, 'developer');
      await grantRoleOnNamespaceOnTeam(team, 'developer', namespace.id);

      const result = await store.teamRolesForNamespaces(team, adminAccount);
      const { currentRoles, namespacesWithoutRoles, rolesGrantable } = result;

      expect(namespacesWithoutRoles.length).toBe(0);

      expect(currentRoles.length).toBe(1);
      expect(currentRoles.find(({ namespace: { id } }) => id === namespace.id).roles).toMatchObject(['developer']);

      expect(rolesGrantable.length).toBe(0);
    });
  });

  describe('Registry roles for a team', () => {
    it('collects role data as seen by global admin', async () => {
      const adminAccount = await saveAccount();
      await grantSystemRole(adminAccount.id, 'admin');
      await grantGlobalRole(adminAccount.id, 'admin');
      const team = await saveTeam();
      const registry = await saveRegistry();
      const registry2 = await saveRegistry();

      await grantRoleOnRegistryOnTeam(team, 'developer', registry.id);
      await grantRoleOnRegistryOnTeam(team, 'observer', registry2.id);

      const result = await store.teamRolesForRegistries(team, adminAccount);
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
      const team = await saveTeam();
      const registry = await saveRegistry();
      const registry2 = await saveRegistry();

      await grantRoleOnRegistry(adminAccount.id, 'admin', registry.id);
      await grantRoleOnRegistry(adminAccount.id, 'admin', registry2.id);
      await grantRoleOnRegistryOnTeam(team, 'developer', registry.id);
      await grantRoleOnRegistryOnTeam(team, 'observer', registry2.id);

      const result = await store.teamRolesForRegistries(team, adminAccount);
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
      const team = await saveTeam();
      const registry = await saveRegistry();
      const registry2 = await saveRegistry();

      await grantRoleOnRegistry(adminAccount.id, 'admin', registry.id);
      await grantRoleOnRegistryOnTeam(team, 'developer', registry.id);
      await grantRoleOnRegistryOnTeam(team, 'observer', registry2.id);

      const result = await store.teamRolesForRegistries(team, adminAccount);
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

    it('provides role data for registries visible to user, not granted to subject team', async () => {
      const adminAccount = await saveAccount();
      const team = await saveTeam();
      const registry = await saveRegistry();
      const registry2 = await saveRegistry();

      await grantRoleOnRegistry(adminAccount.id, 'admin', registry.id);
      await grantRoleOnRegistry(adminAccount.id, 'maintainer', registry2.id);
      await grantRoleOnRegistryOnTeam(team, 'developer', registry.id);

      const result = await store.teamRolesForRegistries(team, adminAccount);
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
      const team = await saveTeam();
      const registry = await saveRegistry();
      await saveRegistry();

      await grantSystemRole(adminAccount.id, 'developer');
      await grantGlobalRole(adminAccount.id, 'developer');
      await grantRoleOnRegistryOnTeam(team, 'developer', registry.id);

      const result = await store.teamRolesForRegistries(team, adminAccount);
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
      const team = await saveTeam();
      await grantSystemRoleOnTeam(team, 'developer', makeMeta({ account: adminAccount }));
      await grantGlobalRoleOnTeam(team, 'developer', makeMeta({ account: adminAccount }));


      const result = await store.teamRolesForSystem(team, adminAccount);
      const { currentRoles } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: true });
    });

    it('revokes global role as global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');
      await grantGlobalRole(maintainerAccount.id, 'maintainer');
      const team = await saveTeam();
      await grantSystemRoleOnTeam(team, 'developer');
      await grantGlobalRoleOnTeam(team, 'developer');
      await revokeGlobalRoleFromTeam(team, 'developer', makeMeta({ account: maintainerAccount }));


      const result = await store.teamRolesForSystem(team, maintainerAccount);
      const { currentRoles } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: false });
    });

    it('cannot revoke global role from non global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');

      const team = await saveTeam();
      await grantSystemRoleOnTeam(team, 'developer');
      await grantGlobalRoleOnTeam(team, 'developer');

      await expect(
        revokeGlobalRoleFromTeam(team, 'developer', makeMeta({ account: maintainerAccount }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot revoke global role developer')
      });
    });

    it('grants global role from global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');
      await grantGlobalRole(maintainerAccount.id, 'maintainer');
      const team = await saveTeam();
      await grantSystemRoleOnTeam(team, 'developer', makeMeta({ account: maintainerAccount }));
      await grantGlobalRoleOnTeam(team, 'developer', makeMeta({ account: maintainerAccount }));


      const result = await store.teamRolesForSystem(team, maintainerAccount);
      const { currentRoles } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: true });
    });

    it('cannot grant global role from non global maintainer', async () => {
      const maintainerAccount = await saveAccount();
      await grantSystemRole(maintainerAccount.id, 'maintainer');

      const team = await saveTeam();
      await grantSystemRoleOnTeam(team, 'developer');

      await expect(
        grantGlobalRoleOnTeam(team, 'developer', makeMeta({ account: maintainerAccount }))
      ).rejects.toMatchObject({
        message: expect.stringMatching('cannot grant global role developer')
      });
    });

    it('collects role data as seen by global admin', async () => {
      const adminAccount = await saveAccount();
      await grantSystemRole(adminAccount.id, 'admin');
      await grantGlobalRole(adminAccount.id, 'admin');
      const team = await saveTeam();
      await grantSystemRoleOnTeam(team, 'developer');


      const result = await store.teamRolesForSystem(team, adminAccount);
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
      const team = await saveTeam();
      await grantSystemRoleOnTeam(team, 'developer');


      const result = await store.teamRolesForSystem(team, maintainerAccount);
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

      const team = await saveTeam();
      await grantSystemRoleOnTeam(team, 'developer');


      const result = await store.teamRolesForSystem(team, maintainerAccount);
      const { currentRoles, rolesGrantable, globalGrantable } = result;

      expect(currentRoles.length).toBe(1);
      expect(currentRoles[0]).toMatchObject({ name: 'developer', global: false });

      expect(rolesGrantable.length).toBe(3);
      expect(rolesGrantable).toMatchObject(['maintainer', 'developer', 'observer']);

      expect(globalGrantable.length).toBe(0);
      expect(globalGrantable).toMatchObject([]);
    });
  });

  describe('Team membership', () => {

    it('Associates an account with a team', async () => {
      const account = await saveAccount();
      const team = await saveTeam();

      await associateAccountWithTeam(account, { id: team });
      const results = await membershipToTeams(account.id);
      expect(results).toBeDefined();
      expect(results.currentMembership).toBeDefined();
      expect(results.currentMembership.length).toBe(1);
      expect(results.currentMembership[0]).toMatchObject({
        id: team,
      });
    });

    it('Disassociates an account with a team', async () => {
      const account = await saveAccount();
      const team = await saveTeam();

      await associateAccountWithTeam(account, { id: team });
      await disassociateAccount(account, { id: team });
      const results = await membershipToTeams(account.id);
      expect(results).toBeDefined();
      expect(results.currentMembership).toBeDefined();
      expect(results.currentMembership.length).toBe(0);
    });

    it('An account inherits team system permissions', async () => {
      const account = await saveAccount();
      const team = await saveTeam();

      await associateAccountWithTeam(account, { id: team });
      expect(await store.hasPermission(account, 'client')).toBe(false);
      await grantSystemRoleOnTeam(team, 'maintainer');
      expect(await store.hasPermission(account, 'client')).toBe(true);
    });

    it('An Account inherits team global permissions', async () => {
      const account = await saveAccount();
      const team = await saveTeam();
      const namespace = await saveNamespace();

      await associateAccountWithTeam(account, { id: team });
      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-read')).toBe(false);
      await grantSystemRoleOnTeam(team, 'maintainer');
      await grantGlobalRoleOnTeam(team, 'maintainer');
      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-read')).toBe(true);
    });

    it('An account inherits team namespace permissions', async () => {
      const account = await saveAccount();
      const team = await saveTeam();
      const namespace = await saveNamespace();

      await associateAccountWithTeam(account, { id: team });
      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-read')).toBe(false);
      await grantRoleOnNamespaceOnTeam(team, 'maintainer', namespace.id);
      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-read')).toBe(true);
    });

    it('An account inherits team registry permissions', async () => {
      const account = await saveAccount();
      const team = await saveTeam();
      const registry = await saveRegistry();

      await associateAccountWithTeam(account, { id: team });
      expect(await store.hasPermissionOnRegistry(account, registry.id, 'registries-read')).toBe(false);
      await grantRoleOnRegistryOnTeam(team, 'maintainer', registry.id);
      expect(await store.hasPermissionOnRegistry(account, registry.id, 'registries-read')).toBe(true);
    });

    it('An account ineherits team "team" permissions', async () => {
      const account = await saveAccount();
      const team = await saveTeam();
      const subjectTeam = await saveTeam();

      await associateAccountWithTeam(account, { id: team });
      expect(await store.hasPermissionOnTeam(account, subjectTeam, 'teams-manage')).toBe(false);
      await grantRoleOnTeamForTeam(team, 'maintainer', subjectTeam);
      expect(await store.hasPermissionOnTeam(account, subjectTeam, 'teams-manage')).toBe(true);
    });

    it('An account inherits permissions from multiple team memberships', async () => {
      const account = await saveAccount();
      const team = await saveTeam();
      const team2 = await saveTeam();
      const namespace = await saveNamespace();
      const registry = await saveRegistry();

      await associateAccountWithTeam(account, { id: team });
      await associateAccountWithTeam(account, { id: team2 });
      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-read')).toBe(false);
      expect(await store.hasPermissionOnRegistry(account, registry.id, 'registries-read')).toBe(false);
      await grantRoleOnNamespaceOnTeam(team, 'maintainer', namespace.id);
      await grantRoleOnRegistryOnTeam(team2, 'maintainer', registry.id);
      expect(await store.hasPermissionOnNamespace(account, namespace.id, 'namespaces-read')).toBe(true);
      expect(await store.hasPermissionOnRegistry(account, registry.id, 'registries-read')).toBe(true);
    });
  });

  function getTeam(team) {
    return store.getTeam(team);
  }

  function saveTeam(team = makeTeam(), meta = makeRootMeta()) {
    return store.saveTeam(team, meta);
  }

  function associateServiceWithTeam(service, team = makeTeam()) {
    return store.associateServiceWithTeam(service, team);
  }

  function associateAccountWithTeam(account, team = makeTeam(), meta = makeRootMeta()) {
    return store.associateAccountWithTeam(account, team, meta);
  }

  function disassociateAccount(account, team = makeTeam(), meta = makeRootMeta()) {
    return store.disassociateAccount(account, team, meta);
  }

  async function saveService(service = makeService(), meta = makeRootMeta()) {
    const release = await store.saveRelease(makeRelease({ service }), meta);
    return release.service;
  }

  function saveNamespace() {
    return store.saveCluster(makeCluster(), makeRootMeta())
      .then(cluster => {
        const namespace = makeNamespace({ cluster });
        return store.saveNamespace(namespace, makeRootMeta());
      });
  }

  function saveRegistry(registry = makeRegistry(), meta = makeRootMeta(), ) {
    return store.saveRegistry(registry, meta);
  }

  function saveAccount(account = makeAccount(), meta = makeRootMeta(), ) {
    return store.saveAccount(account, meta);
  }

  function grantSystemRoleOnTeam(teamId, roleName, meta = makeRootMeta()) {
    return store.grantSystemRoleOnTeam(teamId, roleName, meta);
  }

  function grantGlobalRoleOnTeam(teamId, roleName, meta = makeRootMeta()) {
    return store.grantGlobalRoleOnTeam(teamId, roleName, meta);
  }

  function revokeGlobalRoleFromTeam(teamId, roleName, meta = makeRootMeta()) {
    return store.revokeGlobalRoleFromTeam(teamId, roleName, meta);
  }

  function grantRoleOnRegistryOnTeam(teamId, roleName, registryId, meta = makeRootMeta()) {
    return store.grantRoleOnRegistryOnTeam(teamId, roleName, registryId, meta);
  }

  function revokeRoleOnRegistryFromTeam(teamId, roleName, registryId, meta = makeRootMeta()) {
    return store.revokeRoleOnRegistryFromTeam(teamId, roleName, registryId, meta);
  }

  function grantRoleOnNamespaceOnTeam(teamId, roleName, namespaceId, meta = makeRootMeta()) {
    return store.grantRoleOnNamespaceOnTeam(teamId, roleName, namespaceId, meta);
  }

  function revokeRoleOnNamespaceFromTeam(teamId, roleName, namespaceId, meta = makeRootMeta()) {
    return store.revokeRoleOnNamespaceFromTeam(teamId, roleName, namespaceId, meta);
  }

  function grantRoleOnTeamForTeam(teamId, roleName, subjectTeamId, meta = makeRootMeta()) {
    return store.grantRoleOnTeamForTeam(teamId, roleName, subjectTeamId, meta);
  }

  function revokeRoleOnTeamFromTeam(teamId, roleName, subjectTeamId, meta = makeRootMeta()) {
    return store.revokeRoleOnTeamFromTeam(teamId, roleName, subjectTeamId, meta);
  }

  function grantRoleOnNamespace(accountId, roleName, namespaceId, meta = makeRootMeta()) {
    return store.grantRoleOnNamespace(accountId, roleName, namespaceId, meta);
  }

  function grantRoleOnRegistry(accountId, roleName, registryId, meta = makeRootMeta()) {
    return store.grantRoleOnRegistry(accountId, roleName, registryId, meta);
  }

  function grantSystemRole(accountId, roleName, meta = makeRootMeta()) {
    return store.grantSystemRole(accountId, roleName, meta);
  }

  function grantGlobalRole(accountId, roleName, meta = makeRootMeta()) {
    return store.grantGlobalRole(accountId, roleName, meta);
  }

  function membershipToTeams(accountId, currentUser) {
    return store.membershipToTeams(accountId, currentUser || makeRootMeta().account);
  }
});
