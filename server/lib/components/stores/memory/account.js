import { v4 as uuid, } from 'uuid';

export default function(options = {}) {

  function start({ tables, }, cb) {

    const { accounts, identities, account_roles, } = tables;
    const roles = {
      admin: {
        permissions: ["role_revoke", "role_grant", "releases_write", "releases_read", "deployments_write", "deployments_read", "client", "accounts_write", "accounts_read",],
      },
    };

    async function getAccount(id) {
      const account = accounts.find(a => a.id === id && !a.deletedOn);
      if (account) return {
        ...account,
        roles: account_roles.filter(ar => ar.account === id && !ar.deletedOn).reduce((result, accountRole) => {
          result[accountRole.role] = { name: accountRole.role, permissions: roles[accountRole.role].permissions.slice(), };
          return result;
        }, {}),
      };
    }

    async function findAccount({ name, provider, type, }) {
      const identity = identities.find(i => i.name === name && i.provider === provider && i.type === type && !i.deletedOn);
      if (!identity) return;

      return accounts.find(a => a.id === identity.account);
    }

    async function saveAccount(account, meta) {

      return append(accounts, {
        ...account, id: uuid(), createdOn: meta.date, createdBy: meta.user,
      });
    }

    async function listAccounts(limit = 50, offset = 0) {
      return accounts.filter(byActive)
        .sort(byDisplayName)
        .slice(offset, offset + limit);
    }

    async function deleteAccount(id, meta) {
      const account = accounts.find(a => a.id === id && !a.deletedOn);
      if (account) {
        account.deletedOn = meta.date;
        account.deletedBy = meta.user;
      }
    }

    async function saveIdentity(id, identity, meta) {
      reportDuplicateIdentities(identity);
      reportMissingAccount(id);
      return append(identities, {
        ...identity, id: uuid(), account: id, createdOn: meta.date, createdBy: meta.user,
      });
    }

    async function deleteIdentity(id, meta) {
      const identity = identities.find(i => i.id === id && !i.deletedOn);
      if (identity) {
        identity.deletedOn = meta.date;
        identity.deletedBy = meta.user;
      }
    }

    async function grantRole(accountId, roleName, meta) {
      const account = accounts.find(a => a.id === accountId && !a.deletedOn);
      if (!account) throw Object.assign(new Error('Missing Account'), { code: '23502', });
      if (!roles[roleName]) throw Object.assign(new Error('Missing Role'), { code: '23502', });

      if (account_roles.find(ar => ar.account === accountId && ar.role === roleName && !ar.deletedOn)) return;

      const granted = {
        id: uuid(), account: accountId, role: roleName, createdOn: meta.date, createdBy: meta.user,
      };

      return append(account_roles, granted);
    }

    async function revokeRole(id, meta) {
      const accountRole = account_roles.find(ar => ar.id === id && !ar.deletedOn);
      if (accountRole) {
        accountRole.deletedOn = meta.date;
        accountRole.deletedBy = meta.user;
      }
    }

    function reportDuplicateIdentities(identity) {
      if (identities.find(i => i.name === identity.name && i.provider === identity.provider && i.type === identity.type && !i.deletedOn)) throw Object.assign(new Error('Duplicate Identity'), { code: '23505', });
    }

    function reportMissingAccount(id) {
      if (!accounts.find(a => a.id === id && !a.deletedOn)) throw Object.assign(new Error('Missing Account'), { code: '23502', });
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
