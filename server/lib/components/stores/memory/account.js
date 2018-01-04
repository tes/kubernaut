import { v4 as uuid, } from 'uuid';
import intersection from 'lodash.intersection';

export default function(options = {}) {

  function start({ tables, }, cb) {

    const { namespaces, accounts, identities, account_roles, } = tables;
    const roles = {
      admin: {
        permissions: [
          "role-revoke", "role-grant", "releases-write", "releases-read", "deployments-write", "deployments-read", "client", "accounts-write", "accounts-read", "namespaces-write", "namespaces-read",
          ],
      },
    };

    async function getAccount(id) {
      const account = accounts.find(a => a.id === id && !a.deletedOn);
      if (!account) return;

      const accountRoles = account_roles.filter(ar => ar.account === id && !ar.deletedOn).reduce((result, accountRole) => {
        result[accountRole.role] = result[accountRole.role] || {
          name: accountRole.role,
          permissions: roles[accountRole.role].permissions.slice(),
          namespaces: [],
        };

        result[accountRole.role].namespaces.push(accountRole.namespace || '*');
        return result;
      }, {});

      return {
        ...account,
        roles: accountRoles,
        hasPermission: function(namespace, permission) {
          return Object.keys(accountRoles).reduce((permissions, name) => {
            return permissions.concat(accountRoles[name].permissions);
          }, []).includes(permission);
        },
        permittedNamespaces: function(permission) {
          return Object.keys(accountRoles).reduce((namespaces, name) => {
            if (!accountRoles[name].permissions.includes(permission)) return namespaces;
            return namespaces.concat(accountRoles[name].namespaces);
          }, []);
        },
      };
    }

    async function findAccount({ name, provider, type, }) {
      const identity = identities.find(i => i.name === name && i.provider === provider && i.type === type && !i.deletedOn);
      if (!identity) return;

      const account = accounts.find(a => a.id === identity.account);
      return await getAccount(account.id);
    }

    async function saveAccount(account, meta) {
      return append(accounts, {
        ...account, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      });
    }

    async function ensureAccount(account, identity, meta) {
      reportMissingMetadata(meta);

      const existing = await findAccount(identity);
      if (existing) return existing;

      const created = await saveAccount(account, meta);
      await saveIdentity(created.id, identity, meta);

      if (await countActiveAdminstrators() === 0) {
        await grantRole(created.id, 'admin', null, meta);
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
      reportMissingAccount(id);
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

    async function grantRole(accountId, roleName, namespaceName, meta) {
      reportMissingMetadata(meta);
      reportMissingAccount(accountId);
      reportMissingRole(roleName);
      reportMissingNamespace(namespaceName);

      if (hasRole(accountId, roleName)) return;

      const granted = {
        id: uuid(), account: accountId, role: roleName, namespace: namespaceName, createdOn: meta.date, createdBy: meta.account,
      };

      return append(account_roles, granted);
    }

    async function revokeRole(id, meta) {
      reportMissingMetadata(meta);
      const accountRole = account_roles.find(ar => ar.id === id && !ar.deletedOn);
      if (accountRole) {
        accountRole.deletedOn = meta.date;
        accountRole.deletedBy = meta.account;
      }
    }

    async function countActiveAdminstrators() {
      return intersection(
        accounts.filter(a => !a.deletedOn).map(a => a.id),
        account_roles.filter(ar => ar.role === 'admin' && !ar.deletedOn).map(ar => ar.account),
        identities.filter(i => !i.deletedOn).map(i => i.account),
      ).length;
    }

    function reportDuplicateIdentities(identity) {
      if (identities.find(i => i.name === identity.name && i.provider === identity.provider && i.type === identity.type && !i.deletedOn)) throw Object.assign(new Error('Duplicate Identity'), { code: '23505', });
    }

    function reportMissingAccount(id) {
      if (!accounts.find(a => a.id === id && !a.deletedOn)) throw Object.assign(Object.assign(new Error(`Invalid accountId: ${id}`), { code: '23502', }));
    }

    function reportMissingMetadata(meta) {
      if (!meta.date || !meta.account) throw Object.assign(new Error('Missing Metadata'), { code: '23502', });
    }

    function reportMissingRole(name) {
      if (!roles[name]) throw Object.assign(new Error(`Invalid role: ${name}`));
    }

    function reportMissingNamespace(name) {
      if (name && !namespaces.find(n => n.name === name && !n.deletedOn)) throw Object.assign(Object.assign(new Error(`Invalid namespace: ${name}`), { code: '23502', }));
    }

    function hasRole(accountId, roleName) {
      return account_roles.find(ar => ar.account === accountId && ar.role === roleName && !ar.deletedOn);
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
      grantRole,
      revokeRole,
    });
  }

  return {
    start,
  };
}
