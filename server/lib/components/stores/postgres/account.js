import SQL from './sql';
import uniq from 'lodash.uniq';
import Account from '../../../domain/Account';

export default function(options = {}) {
  function start({ config, logger, db, }, cb) {

    async function getAccount(id) {
      logger.debug(`Getting account by id: ${id}`);

      return Promise.all([
        db.query(SQL.SELECT_ACCOUNT_BY_ID, [id,]),
        db.query(SQL.LIST_ROLES_AND_PERMISSIONS_BY_ACCOUNT, [id,]),
      ]).then(([accountResult, rolesAndPermissionsResult, ]) => {
        logger.debug(`Found ${accountResult.rowCount} accounts with id: ${id}`);
        return accountResult.rowCount ? toAccount(accountResult.rows[0], rolesAndPermissionsResult.rows) : undefined;
      });
    }

    async function findAccount({ name, provider, type, }) {
      logger.debug(`Finding account by identity: ${type}/${name}/${provider}`);

      const account = await db.query(SQL.SELECT_ACCOUNT_BY_IDENTITY, [
        name, provider, type,
      ]);
      logger.debug(`Found ${account.rowCount} accounts with identity: ${type}/${name}/${provider}`);
      if (account.rowCount === 0) return;

      return getAccount(account.rows[0].id);
    }

    async function saveAccount(data, meta) {
      return _saveAccount(db, data, meta);
    }

    async function _saveAccount(connection, data, meta) {
      logger.debug(`Saving account: ${data.displayName}`);

      const result = await connection.query(SQL.SAVE_ACCOUNT, [
        data.displayName, data.avatar, meta.date, meta.account.id,
      ]);

      await db.refreshEntityCount();

      const account = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

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
        const counts = await _countActiveGlobalAdminstrators(connection);
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

    async function listAccounts(limit = 50, offset = 0) {
      logger.debug(`Listing up to ${limit} accounts starting from offset: ${offset}`);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.LIST_ACCOUNTS, [ limit, offset, ]),
          connection.query(SQL.COUNT_ACTIVE_ENTITIES, [ 'account', ]),
        ]).then(([accountResult, countResult,]) => {
          const items = accountResult.rows.map(row => toAccount(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} accounts`);
          return { limit, offset, count, items, };
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
      await db.refreshEntityCount();
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

    async function grantRoleOnRegistry(accountId, roleName, registryName, meta) {
      return db.withTransaction(async connection => {
        return _grantRoleOnRegistry(connection, accountId, roleName, registryName, meta);
      });
    }

    async function _grantRoleOnRegistry(connection, accountId, roleName, registryName, meta) {
      logger.debug(`Granting role: ${roleName} on registry: ${registryName} to account: ${accountId}`);

      return Promise.all([
        connection.query(SQL.SELECT_ACCOUNT_BY_ID, [ accountId, ]),
        connection.query(SQL.SELECT_ROLE_BY_NAME, [ roleName, ]),
        connection.query(SQL.SELECT_REGISTRY_BY_NAME, [ registryName, ]),
      ]).then(([ accountResult, roleResult, registryResult, ]) => {
        return {
          accountId: getAccountId(accountResult, accountId),
          roleId: getRoleId(roleResult, roleName),
          registryId: getRegistryId(registryResult, registryName),
        };
      }).then(async ({ accountId, roleId, registryId, }) => {
        const result = await connection.query(SQL.ENSURE_ACCOUNT_ROLE_ON_REGISTRY, [
          accountId, roleId, registryId, meta.date, meta.account.id,
        ]);
        const granted = {
          id: result.rows[0].id, account: accountId, name: roleName, createdOn: meta.date, createdBy: meta.account.id,
        };

        logger.debug(`Granted role: ${granted.name}/${granted.id} on registry: ${registryName} to account: ${accountId}`);

        return granted;
      });
    }

    async function revokeRoleOnRegistry(id, meta) {
      logger.debug(`Revoking role: ${id} on registry`);

      await db.query(SQL.DELETE_ACCOUNT_ROLE_ON_REGISTRY, [
        id, meta.date, meta.account.id,
      ]);

      logger.debug(`Revoked role: ${id} on registry`);
    }

    async function grantRoleOnNamespace(accountId, roleName, namespaceName, meta) {
      return db.withTransaction(async connection => {
        return _grantRoleOnNamespace(connection, accountId, roleName, namespaceName, meta);
      });
    }

    async function _grantRoleOnNamespace(connection, accountId, roleName, namespaceName, meta) {
      logger.debug(`Granting role: ${roleName} on namespace: ${namespaceName} to account: ${accountId}`);

      return Promise.all([
        connection.query(SQL.SELECT_ACCOUNT_BY_ID, [ accountId, ]),
        connection.query(SQL.SELECT_ROLE_BY_NAME, [ roleName, ]),
        connection.query(SQL.SELECT_NAMESPACE_BY_NAME, [ namespaceName, ]),
      ]).then(([ accountResult, roleResult, namespaceResult, ]) => {
        return {
          accountId: getAccountId(accountResult, accountId),
          roleId: getRoleId(roleResult, roleName),
          namespaceId: getNamespaceId(namespaceResult, namespaceName),
        };
      }).then(async ({ accountId, roleId, namespaceId, }) => {
        const result = await connection.query(SQL.ENSURE_ACCOUNT_ROLE_ON_NAMESPACE, [
          accountId, roleId, namespaceId, meta.date, meta.account.id,
        ]);
        const granted = {
          id: result.rows[0].id, account: accountId, name: roleName, createdOn: meta.date, createdBy: meta.account.id,
        };

        logger.debug(`Granted role: ${granted.name}/${granted.id} on namespace: ${namespaceName} to account: ${accountId}`);

        return granted;
      });
    }

    async function revokeRoleOnNamespace(id, meta) {
      logger.debug(`Revoking role: ${id} on namespace`);

      await db.query(SQL.DELETE_ACCOUNT_ROLE_ON_NAMESPACE, [
        id, meta.date, meta.account.id,
      ]);

      logger.debug(`Revoked role: ${id} on namespace`);
    }

    function getAccountId(result, accountId) {
      const id = result.rowCount ? result.rows[0].id : null;
      if (!id) throw new Error(`Invalid accountId: ${accountId}`);
      return id;
    }

    function getRoleId(result, name) {
      const id = result.rowCount ? result.rows[0].id : null;
      if (!id) throw new Error(`Invalid role: ${name}`);
      return id;
    }

    function getRegistryId(result, name) {
      const id = result.rowCount ? result.rows[0].id : null;
      if (!id && name) throw new Error(`Invalid registry: ${name}`);
      return id;
    }

    function getNamespaceId(result, name) {
      const id = result.rowCount ? result.rows[0].id : null;
      if (!id && name) throw new Error(`Invalid namespace: ${name}`);
      return id;
    }

    async function _countActiveGlobalAdminstrators(connection) {
      logger.debug('Counting active global administrators');

      const result = await connection.query(SQL.COUNT_ACTIVE_GLOBAL_ADMINISTRATORS);
      const counts = {
        registry: parseInt(result.rows[0].registry, 10),
        namespace: parseInt(result.rows[0].namespace, 10),
      };
      logger.debug(`Found ${counts.registry}/${counts.namespace} active global administrator accounts`);

      return counts;
    }

    function toAccount(row, rolesAndPermissionsRows = []) {
      const roles = toRolesAndPermissions(rolesAndPermissionsRows);
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

    function toRolesAndPermissions(rows) {
      const differentiatorCollections = {
        registry: 'registries',
        namespace: 'namespaces',
      };
      return rows.reduce((roles, row) => {
        const entry = roles[row.role_name] || { name: row.role_name, permissions: [], registries: [], namespaces: [], };
        entry.permissions.push(row.permission_name);
        const collection = differentiatorCollections[row.differentiator];
        entry[collection] = uniq(entry[collection].concat(row.subject_name || '*'));
        roles[row.role_name] = entry;
        return roles;
      }, {});
    }

    return cb(null, {
      getAccount,
      findAccount,
      saveAccount,
      ensureAccount,
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
