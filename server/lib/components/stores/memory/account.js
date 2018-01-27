import { v4 as uuid, } from 'uuid';
import intersection from 'lodash.intersection';
import Account from '../../../domain/Account';
import uniq from 'lodash.uniq';

export default function(options = {}) {

  function start({ tables, namespaces, registries, }, cb) {

    const { accounts, identities, account_roles, } = tables;
    const roles = {
      admin: {
        permissions: [
          "role-revoke", "role-grant",
          "releases-write", "releases-read",
          "deployments-write", "deployments-read",
          "client",
          "accounts-write", "accounts-read",
          "namespaces-write", "namespaces-read",
          "registries-write", "registries-read",
        ],
      },
    };

    async function getAccount(id) {
      const account = accounts.find(a => a.id === id && !a.deletedOn);
      if (!account) return;

      const allRegistryIds = (await registries.listRegistries(Number.MAX_SAFE_INTEGER, 0)).items.map(r => r.id);
      const allNamespaceIds = (await namespaces.listNamespaces(Number.MAX_SAFE_INTEGER, 0)).items.map(n => n.id);

      const subjects = {
        registry: {
          name: 'registries',
          allSubjectIds: allRegistryIds,
        },
        namespace: {
          name: 'namespaces',
          allSubjectIds: allNamespaceIds,
        },
      };

      const accountRoles = account_roles.filter(ar => ar.account === id && !ar.deletedOn).reduce((result, row) => {
        const collection = subjects[row.differentiator];
        const entry = result[row.role] || { name: row.role, permissions: [], namespaces: [], registries: [], };
        entry.permissions = entry.permissions.concat(roles[row.role].permissions.slice());
        entry[collection.name] = uniq(entry[collection.name].concat(row.subject || collection.allSubjectIds.slice()));
        result[row.role] = entry;
        return result;
      }, {});

      return new Account({ ...account, roles: accountRoles, });
    }

    async function findAccount({ name, provider, type, }) {
      const identity = identities.find(i => i.name === name && i.provider === provider && i.type === type && !i.deletedOn);
      if (!identity) return;

      const account = accounts.find(a => a.id === identity.account);
      return await getAccount(account.id);
    }

    async function saveAccount(account, meta) {
      return append(accounts, new Account({
        ...account, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      }));
    }

    async function ensureAccount(account, identity, meta) {
      reportMissingMetadata(meta);

      const existing = await findAccount(identity);
      if (existing) return existing;

      const created = await saveAccount(account, meta);
      await saveIdentity(created.id, identity, meta);

      const counts = await _countActiveAdminstrators();

      if (counts.registry === 0) {
        await grantRoleOnRegistry(created.id, 'admin', null, meta);
      }
      if (counts.namespace === 0) {
        await grantRoleOnNamespace(created.id, 'admin', null, meta);
      }

      return await getAccount(created.id);
    }

    async function listAccounts(limit = 50, offset = 0) {
      const active = accounts.filter(byActive).sort(byDisplayName);
      const count = active.length;
      const items = active.slice(offset, offset + limit);
      return { limit, offset, count, items, };
    }

    async function deleteAccount(id, meta) {
      reportMissingMetadata(meta);
      const account = accounts.find(a => a.id === id && !a.deletedOn);
      if (account) {
        account.deletedOn = meta.date;
        account.deletedBy = meta.account;
      }
    }

    async function saveIdentity(id, identity, meta) {
      reportMissingMetadata(meta);
      reportDuplicateIdentities(identity);
      reportMissingAccount(id, '23502');
      return append(identities, {
        ...identity, id: uuid(), account: id, createdOn: meta.date, createdBy: meta.account,
      });
    }

    async function deleteIdentity(id, meta) {
      reportMissingMetadata(meta);
      const identity = identities.find(i => i.id === id && !i.deletedOn);
      if (identity) {
        identity.deletedOn = meta.date;
        identity.deletedBy = meta.account;
      }
    }

    async function grantRoleOnRegistry(accountId, roleName, registryId, meta) {
      reportMissingMetadata(meta);
      reportMissingAccount(accountId, '23503');
      reportMissingRole(roleName);
      await reportMissingRegistry(registryId);

      if (hasRole(accountId, roleName, 'registry')) return;

      const granted = {
        id: uuid(), account: accountId, role: roleName, subject: registryId, differentiator: 'registry', createdOn: meta.date, createdBy: meta.account,
      };

      return append(account_roles, granted);
    }

    async function revokeRoleOnRegistry(id, meta) {
      reportMissingMetadata(meta);
      const accountRole = account_roles.find(ar =>
        ar.id === id &&
        ar.differentiator === 'registry' &&
        !ar.deletedOn
      );
      if (accountRole) {
        accountRole.deletedOn = meta.date;
        accountRole.deletedBy = meta.account;
      }
    }

    async function grantRoleOnNamespace(accountId, roleName, namespaceId, meta) {
      reportMissingMetadata(meta);
      reportMissingAccount(accountId, '23503');
      reportMissingRole(roleName);
      await reportMissingNamespace(namespaceId);

      if (hasRole(accountId, roleName, 'namespace')) return;

      const granted = {
        id: uuid(), account: accountId, role: roleName, subject: namespaceId, differentiator: 'namespace', createdOn: meta.date, createdBy: meta.account,
      };

      return append(account_roles, granted);
    }

    async function revokeRoleOnNamespace(id, meta) {
      reportMissingMetadata(meta);
      const accountRole = account_roles.find(ar =>
        ar.id === id &&
        ar.differentiator === 'namespace' &&
        !ar.deletedOn
      );
      if (accountRole) {
        accountRole.deletedOn = meta.date;
        accountRole.deletedBy = meta.account;
      }
    }

    async function _countActiveAdminstrators() {
      return {
        registry: intersection(
          accounts.filter(a => !a.deletedOn).map(a => a.id),
          account_roles.filter(ar => ar.role === 'admin' && ar.differentiator === 'registry' && !ar.deletedOn).map(ar => ar.account),
          identities.filter(i => !i.deletedOn).map(i => i.account),
        ).length,
        namespace: intersection(
          accounts.filter(a => !a.deletedOn).map(a => a.id),
          account_roles.filter(ar => ar.role === 'admin' && ar.differentiator === 'namespace' && !ar.deletedOn).map(ar => ar.account),
          identities.filter(i => !i.deletedOn).map(i => i.account),
        ).length,
      };
    }

    function reportDuplicateIdentities(identity) {
      if (identities.find(i => i.name === identity.name && i.provider === identity.provider && i.type === identity.type && !i.deletedOn)) throw Object.assign(new Error('Duplicate Identity'), { code: '23505', });
    }

    function reportMissingAccount(id, code) {
      if (!accounts.find(a => a.id === id && !a.deletedOn)) throw Object.assign(Object.assign(new Error(`Invalid accountId: ${id}`), { code, }));
    }

    function reportMissingMetadata(meta) {
      if (!meta.date || !meta.account) throw Object.assign(new Error('Missing Metadata'), { code: '23502', });
    }

    function reportMissingRole(name) {
      if (!roles[name]) throw Object.assign(new Error(`Invalid role: ${name}`), { code: '23502', });
    }

    async function reportMissingRegistry(id) {
      if (!id) return;
      const registry = await registries.getRegistry(id);
      if (!registry) throw Object.assign(new Error(`Invalid registry: ${id}`), { code: '22P02', });
    }

    async function reportMissingNamespace(id) {
      if (!id) return;
      const namespace = await namespaces.getNamespace(id);
      if (!namespace) throw Object.assign(new Error(`Invalid namespace: ${id}`), { code: '22P02', });
    }

    function hasRole(accountId, roleName, differentiator) {
      return account_roles.find(ar =>
        ar.account === accountId &&
        ar.role === roleName &&
        ar.differentiator === differentiator &&
        !ar.deletedOn
      );
    }

    function byActive(a) {
      return !a.deletedOn;
    }

    function byDisplayName(a, b) {
      return a.displayName.localeCompare(b.displayName);
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveAccount,
      ensureAccount,
      getAccount,
      findAccount,
      listAccounts,
      deleteAccount,
      saveIdentity,
      deleteIdentity,
      grantRoleOnRegistry,
      revokeRoleOnRegistry,
      grantRoleOnNamespace,
      revokeRoleOnNamespace,
    });
  }

  return {
    start,
  };
}
