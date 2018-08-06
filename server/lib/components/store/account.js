import SQL from './sql';
import uniq from 'lodash.uniq';
import Account from '../../domain/Account';
import sqb from 'sqb';

export default function(options = {}) {
  function start({ config, logger, db }, cb) {

  const { Op, raw } = sqb;

    async function saveAccount(data, meta) {
      return _saveAccount(db, data, meta);
    }

    async function _saveAccount(connection, data, meta) {
      logger.debug(`Saving account: ${data.displayName}`);

      const result = await connection.query(SQL.SAVE_ACCOUNT, [
        data.displayName, data.avatar, meta.date, meta.account.id,
      ]);

      const account = new Account({
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      });

      logger.debug(`Saved account: ${account.displayName}/${account.id}`);

      return account;
    }

    async function ensureAccount(data, identity, meta) {

      logger.debug(`Ensuring account: ${data.displayName}`);

      const existing = await findAccount(identity);
      if (existing) return existing;

      const created = await db.withTransaction(async connection => {
        const saved = await _saveAccount(connection, data, meta);
        await _saveIdentity(connection, saved.id, identity, meta);
        const counts = await _countActiveAdminstrators(connection);
        if (counts.registry === 0) {
          await _grantRoleOnRegistry(connection, saved.id, 'admin', null, meta);
        }
        if (counts.namespace === 0) {
          await _grantRoleOnNamespace(connection, saved.id, 'admin', null, meta);
        }
        return saved;
      });

      const account = await getAccount(created.id);

      logger.debug(`Ensured account: ${account.displayName}/${account.id}`);

      return account;
    }

    async function getAccount(id) {
      logger.debug(`Getting account by id: ${id}`);

      return Promise.all([
        db.query(SQL.SELECT_ACCOUNT_BY_ID, [id]),
        db.query(SQL.LIST_REGISTRIES),
        db.query(SQL.LIST_NAMESPACES),
        db.query(SQL.LIST_ROLES_AND_PERMISSIONS_BY_ACCOUNT, [id]),
      ]).then(([accountResult, registriesResult, namespacesResult, rolesAndPermissionsResult ]) => {
        logger.debug(`Found ${accountResult.rowCount} accounts with id: ${id}`);
        const registries = registriesResult.rows.map(row => row.id);
        const namespaces = namespacesResult.rows.map(row => row.id);
        const roles = toRolesAndPermissions(rolesAndPermissionsResult.rows, registries, namespaces);
        return accountResult.rowCount ? toAccount(accountResult.rows[0], roles) : undefined;
      });
    }

    async function findAccount({ name, provider, type }) {
      logger.debug(`Finding account by identity: ${name}/${provider}/${type}`);

      const account = await db.query(SQL.SELECT_ACCOUNT_BY_IDENTITY, [
        name, provider, type,
      ]);
      logger.debug(`Found ${account.rowCount} accounts with identity: ${name}/${provider}/${type}`);
      if (account.rowCount === 0) return;

      return getAccount(account.rows[0].id);
    }

    async function findAccounts(criteria = {}, limit = 50, offset = 0) {

      logger.debug(`Finding up to ${limit} accounts matching criteria: ${criteria} starting from offset: ${offset}`);

      const bindVariables = {};

      const findAccountsBuilder = sqb
        .select('a.id', 'a.display_name', 'a.created_on', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_account__vw a', 'account cb')
        .where(Op.eq('a.created_by', raw('cb.id')))
        .orderBy('a.display_name asc')
        .limit(limit)
        .offset(offset);

      const countAccountsBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_account__vw a');

      const findAccountsStatement = db.serialize(findAccountsBuilder, bindVariables);
      const countAccountsStatement = db.serialize(countAccountsBuilder, bindVariables);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(findAccountsStatement.sql, findAccountsStatement.values),
          connection.query(countAccountsStatement.sql, countAccountsStatement.values),
        ]).then(([accountResult, countResult]) => {
          const items = accountResult.rows.map(row => toAccount(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} accounts`);
          return { limit, offset, count, items };
        });
      });
    }

    async function deleteAccount(id, meta) {
      logger.debug(`Deleting account id: ${id}`);
      await db.query(SQL.DELETE_ACCOUNT, [
        id,
        meta.date,
        meta.account.id,
      ]);
      logger.debug(`Deleted account id: ${id}`);
    }

    async function saveIdentity(id, data, meta) {
      return _saveIdentity(db, id, data, meta);
    }

    async function _saveIdentity(connection, id, data, meta) {
      logger.debug(`Saving identity: ${data.type}/${data.provider}/${data.name} for account ${id}`);

      const result = await connection.query(SQL.SAVE_IDENTITY, [
        id, data.name, data.provider, data.type, meta.date, meta.account.id,
      ]);

      const identity = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Saved identity: ${data.type}/${data.provider}/${data.name}/${result.rows[0].id} for account ${id}`);

      return identity;
    }

    async function deleteIdentity(id, meta) {
      logger.debug(`Deleting identity id: ${id}`);
      await db.query(SQL.DELETE_IDENTITY, [
        id, meta.date, meta.account.id,
      ]);
      logger.debug(`Deleted identity id: ${id}`);
    }

    async function grantRoleOnRegistry(accountId, roleName, registryId, meta) {
      await db.withTransaction(async connection => {
        return _grantRoleOnRegistry(connection, accountId, roleName, registryId, meta);
      });

      return getAccount(accountId);
    }

    async function _grantRoleOnRegistry(connection, accountId, roleName, registryId, meta) {
      logger.debug(`Granting role: ${roleName} on registry: ${registryId} to account: ${accountId}`);

      const result = await connection.query(SQL.ENSURE_ACCOUNT_ROLE_ON_REGISTRY, [
        accountId, roleName, registryId, meta.date, meta.account.id,
      ]);

      const granted = {
        id: result.rows[0].id, account: accountId, name: roleName, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Granted role: ${granted.name}/${granted.id} on registry: ${registryId} to account: ${accountId}`);

      return granted;
    }

    async function revokeRoleOnRegistry(accountId, roleName, registryId, meta) {
      logger.debug(`Revoking role: ${roleName} on registry: ${registryId} to account: ${accountId}`);

      await db.query(SQL.DELETE_ACCOUNT_ROLE_ON_REGISTRY, [
        accountId, roleName, registryId, meta.date, meta.account.id,
      ]);

      logger.debug(`Revoked role: ${roleName} on registry: ${registryId} to account: ${accountId}`);

      return getAccount(accountId);
    }

    async function grantRoleOnNamespace(accountId, roleName, namespaceId, meta) {
      await db.withTransaction(async connection => {
        await _grantRoleOnNamespace(connection, accountId, roleName, namespaceId, meta);
      });

      return getAccount(accountId);
    }

    async function _grantRoleOnNamespace(connection, accountId, roleName, namespaceId, meta) {
      logger.debug(`Granting role: ${roleName} on namespace: ${namespaceId} to account: ${accountId}`);

      const result = await connection.query(SQL.ENSURE_ACCOUNT_ROLE_ON_NAMESPACE, [
        accountId, roleName, namespaceId, meta.date, meta.account.id,
      ]);
      const granted = {
        id: result.rows[0].id, account: accountId, name: roleName, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Granted role: ${granted.name}/${granted.id} on namespace: ${namespaceId} to account: ${accountId}`);

      return granted;
    }

    async function revokeRoleOnNamespace(accountId, roleName, namespaceId, meta) {
      logger.debug(`Revoking role: ${roleName} on namespace: ${namespaceId} to account: ${accountId}`);

      await db.query(SQL.DELETE_ACCOUNT_ROLE_ON_NAMESPACE, [
        accountId, roleName, namespaceId, meta.date, meta.account.id,
      ]);

      logger.debug(`Revoked role: ${roleName} on namespace: ${namespaceId} to account: ${accountId}`);

      return getAccount(accountId);
    }

    async function _countActiveAdminstrators(connection) {
      logger.debug('Counting active administrators');

      const result = await connection.query(SQL.COUNT_ACTIVE_ADMINISTRATORS);
      const counts = {
        registry: parseInt(result.rows[0].registry, 10),
        namespace: parseInt(result.rows[0].namespace, 10),
      };
      logger.debug(`Found ${counts.registry}/${counts.namespace} active administrator accounts`);

      return counts;
    }

    function toAccount(row, roles) {
      return new Account({
        id: row.id,
        displayName: row.display_name,
        avatar: row.avatar,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
        roles,
      });
    }

    function toRolesAndPermissions(rows, allRegistryIds, allNamespaceIds) {
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
      return rows.reduce((roles, row) => {
        const collection = subjects[row.differentiator];
        const entry = roles[row.role_name] || { name: row.role_name, permissions: [], registries: [], namespaces: [] };
        entry.permissions.push(row.permission_name);
        entry[collection.name] = uniq(entry[collection.name].concat(row.subject_id || collection.allSubjectIds.slice()));
        roles[row.role_name] = entry;
        return roles;
      }, {});
    }

    return cb(null, {
      saveAccount,
      ensureAccount,
      getAccount,
      findAccount,
      findAccounts,
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
