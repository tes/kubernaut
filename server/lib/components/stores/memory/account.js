import { v4 as uuid, } from 'uuid';

export default function(options = {}) {
  function start({ tables, }, cb) {

    const { accounts, } = tables;

    async function getAccount(id) {
      return accounts.find(a => a.id === id && !a.deletedOn);
    }

    async function findAccount({ identity, provider, }) {
      const account = accounts.find(a => a.identity === identity && a.provider === provider && !a.deletedOn);
      if (!account) return;
      return account;
    }

    async function saveAccount(account, meta) {
      reportDuplicateAccounts(account);

      return append(accounts, {
        ...account, id: uuid(), createdOn: meta.date, createdBy: meta.user,
      });
    }

    async function deleteAccount(id, meta) {
      const account = accounts.find(a => a.id === id && !a.deletedOn);
      if (account) {
        account.deletedOn = meta.date;
        account.deletedBy = meta.user;
      }
    }

    async function listAccounts(limit = 50, offset = 0) {
      return accounts.filter(byActive)
        .sort(byIdentityAndProvider)
        .slice(offset, offset + limit);
    }

    function reportDuplicateAccounts(account) {
      if (accounts.find(a => a.identity === account.identity && a.provider === account.provider && !a.deletedOn)) throw Object.assign(new Error('Duplicate Account'), { code: '23505', });
    }

    function byActive(a) {
      return !a.deletedOn;
    }

    function byIdentityAndProvider(a, b) {
      return a.identity.localeCompare(b.identity) || a.provider.localeCompare(b.provider);
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
    });
  }

  return {
    start,
  };
}
