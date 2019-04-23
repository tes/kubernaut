import { v4 as uuid } from 'uuid';
import SQL from './sql';
import Account from '../../domain/Account';
import Namespace from '../../domain/Namespace';
import Registry from '../../domain/Registry';
import Cluster from '../../domain/Cluster';
import sqb from 'sqb';

export default function(options = {}) {
  function start({ config, logger, db, authz }, cb) {

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
        const count = await _countActiveAdminstrators(connection);
        if (count === 0) {
          await _grantSystemRole(connection, saved.id, 'admin', meta);
          await _grantGlobalRole(connection, saved.id, 'admin', meta);
        } else {
          await _grantSystemRole(connection, saved.id, 'observer', meta);
        }

        return saved;
      });

      const account = await getAccount(created.id);

      logger.debug(`Ensured account: ${account.displayName}/${account.id}`);

      return account;
    }

    async function getAccount(id) {
      logger.debug(`Getting account by id: ${id}`);

      const builder = sqb
        .select('a.id', 'a.display_name', 'a.avatar', 'a.created_on', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_account__vw a')
        .join(sqb.join('account cb').on(Op.eq('a.created_by', raw('cb.id'))))
        .where(Op.eq('a.id', id));

      const result = await db.query(db.serialize(builder, {}).sql);
      if (!result.rowCount) return undefined;
      const account = toAccount(result.rows[0]);
      return account;
    }

    function toNamespaceRoles(row) {
      return {
        roles: row.roles,
        namespace: new Namespace({
          id: row.namespace_id,
          name: row.namespace_name,
          cluster: new Cluster({
            name: row.cluster_name
          }),
        }),
      };
    }

    function toRegistryRoles(row) {
      return {
        roles: row.roles,
        registry: new Registry({
          id: row.registry_id,
          name: row.registry_name,
        }),
      };
    }

    async function getRolesForAccount(id, currentUser) {
      logger.debug(`Getting account roles for id: ${id}`);

      const namespacesBuilder = authz.queryNamespacesWithAppliedRolesForUserAsSeenBy(id, currentUser.id);
      const registriesBuilder = authz.queryRegistriesWithAppliedRolesForUserAsSeenBy(id, currentUser.id);
      const systemRolesBuilder = authz.querySystemAppliedRolesForUser(id);

      return await db.withTransaction(async connection => {
        const namespacesResults = await connection.query(db.serialize(namespacesBuilder, {}).sql);
        const registriesResults = await connection.query(db.serialize(registriesBuilder, {}).sql);
        const systemResults = await connection.query(db.serialize(systemRolesBuilder, {}).sql);

        return {
          namespaces: namespacesResults.rows.map(toNamespaceRoles),
          registries: registriesResults.rows.map(toRegistryRoles),
          system: systemResults.rows,
        };
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

    const sortMapping = {
      name: 'a.display_name',
      createdOn: 'a.created_on',
      createdBy: 'created_by_display_name',
    };

    async function findAccounts(criteria = {}, limit = 50, offset = 0, sort = 'name', order = 'asc') {

      logger.debug(`Finding up to ${limit} accounts matching criteria: ${criteria} starting from offset: ${offset}`);

      const bindVariables = {};
      const sortColumn = sortMapping[sort] || 'a.display_name';
      const sortOrder = (order === 'asc' ? 'asc' : 'desc');

      const findAccountsBuilder = sqb
        .select('a.id', 'a.display_name', 'a.created_on', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_account__vw a', 'account cb')
        .where(Op.eq('a.created_by', raw('cb.id')))
        .orderBy(`${sortColumn} ${sortOrder}`)
        .limit(limit)
        .offset(offset);

      const countAccountsBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_account__vw a', 'account cb')
        .where(Op.eq('a.created_by', raw('cb.id')));

      if (criteria && criteria.filters) {
        if (criteria.filters.name) {
          db.applyFilter(criteria.filters.name, 'a.display_name', findAccountsBuilder, countAccountsBuilder);
        }

        if (criteria.filters.createdBy) {
          db.applyFilter(criteria.filters.createdBy, 'cb.display_name', findAccountsBuilder, countAccountsBuilder);
        }
      }

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

    async function _checkCanGrantGlobal(connection, targetAccountId, viewingAccount, role_id) {
      const canGrantBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from(sqb
          .select('id')
            .from(authz.queryGlobalRolesGrantableAsSeenBy(targetAccountId, viewingAccount.id).as('roles'))
            .where(Op.eq('id', role_id))
            .as('contains')
          );

      const canGrantResult = await connection.query(db.serialize(canGrantBuilder, {}).sql);
      const { answer } = canGrantResult.rows[0];
      return answer;
    }

    async function _checkCanGrantSystem(connection, viewingAccount, role_id) {
      const canGrantBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from(sqb
          .select('id')
            .from(authz.querySystemRolesGrantableAsSeenBy(viewingAccount.id).as('roles'))
            .where(Op.eq('id', role_id))
            .as('contains')
          );

      const canGrantResult = await connection.query(db.serialize(canGrantBuilder, {}).sql);
      const { answer } = canGrantResult.rows[0];
      return answer;
    }

    async function checkCanGrantGlobal(targetAccountId, roleName, meta) {
      return await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        return _checkCanGrantGlobal(connection, targetAccountId, meta.account, role_id);
      });
    }

    async function checkCanRevokeGlobal(targetAccountId, roleName, meta) {
      return await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        return _checkCanGrantGlobal(connection, targetAccountId, meta.account, role_id);
      });
    }

    async function checkCanGrantSystem(roleName, meta) {
      return await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        return _checkCanGrantSystem(connection, meta.account, role_id);
      });
    }

    async function checkCanRevokeSystem(roleName, meta) {
      return await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        return _checkCanGrantSystem(connection, meta.account, role_id);
      });
    }

    async function _grantGlobalRole(connection, accountId, roleName, meta) {
      logger.debug(`Granting role: ${roleName} globally to account: ${accountId}`);

      const roleIdBuilder = sqb
        .select('r.id role_id')
        .from('role r')
        .where(Op.eq('r.name', roleName));

      const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
      if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
      const { role_id } = roleIdResult.rows[0];

      const canGrantAnswer = await _checkCanGrantGlobal(connection, accountId, meta.account, role_id);
      if (!canGrantAnswer) throw new Error(`User ${meta.account.id} cannot grant global role ${roleName}.`);

      const hasSystemRoleBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', accountId))
        .where(Op.eq('ar.subject_type', 'system'))
        .where(Op.eq('ar.role', role_id));

        const systemRoleExistsResult = await connection.query(db.serialize(hasSystemRoleBuilder, {}).sql);
        const { answer: systemAnswer } = systemRoleExistsResult.rows[0];
        if (!systemAnswer) throw new Error(`Cannot grant global role ${roleName} to ${accountId} without having granted it for system.`);

      const existsBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', accountId))
        .where(Op.eq('ar.subject_type', 'global'))
        .where(Op.eq('ar.role', role_id));

      const existsResult = await connection.query(db.serialize(existsBuilder, {}).sql);
      const { answer } = existsResult.rows[0];
      if (answer) return;

      const insertBuilder = sqb
        .insert('account_roles', {
          id: uuid(),
          account: accountId,
          role: role_id,
          subject_type: 'global',
          created_by: meta.account.id,
          created_on: meta.date,
        });

      await connection.query(db.serialize(insertBuilder, {}).sql);
      logger.debug(`Granted role: ${roleName} globally to account: ${accountId}`);
    }

    async function grantGlobalRole(accountId, roleName, meta) {
      await db.withTransaction(async connection => {
        await _grantGlobalRole(connection, accountId, roleName, meta);
      });

      return getAccount(accountId);
    }

    async function revokeGlobalRole(accountId, roleName, meta) {
      logger.debug(`Revoking global role: ${roleName} from account: ${accountId}`);
      await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
        .select('r.id role_id')
        .from('role r')
        .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        const canRevokeAnswer = await _checkCanGrantGlobal(connection, accountId, meta.account, role_id);
        if (!canRevokeAnswer) throw new Error(`User ${meta.account.id} cannot revoke global role ${roleName}.`);

        const builder = sqb
          .update('account_roles', {
            deleted_on: meta.date,
            deleted_by: meta.account.id,
          })
          .where(Op.eq('account', accountId))
          .where(Op.eq('subject_type', 'global'))
          .where(Op.eq('role', role_id))
          .where(Op.is('deleted_on', null));

        await connection.query(db.serialize(builder, {}).sql);
      });

      logger.debug(`Revoked global role: ${roleName} from account: ${accountId}`);
    }

    async function _grantSystemRole(connection, accountId, roleName, meta) {
      logger.debug(`Granting role: ${roleName} for system to account: ${accountId}`);

      const roleIdBuilder = sqb
        .select('r.id role_id')
        .from('role r')
        .where(Op.eq('r.name', roleName));

      const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
      if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
      const { role_id } = roleIdResult.rows[0];

      const canGrantAnswer = await _checkCanGrantSystem(connection, meta.account, role_id);
      if (!canGrantAnswer) throw new Error(`User ${meta.account.id} cannot grant system role ${roleName}.`);

      const existsBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', accountId))
        .where(Op.eq('ar.subject_type', 'system'))
        .where(Op.eq('ar.role', role_id));

      const existsResult = await connection.query(db.serialize(existsBuilder, {}).sql);
      const { answer } = existsResult.rows[0];
      if (answer) return;

      const insertBuilder = sqb
        .insert('account_roles', {
          id: uuid(),
          account: accountId,
          role: role_id,
          subject_type: 'system',
          created_by: meta.account.id,
          created_on: meta.date,
        });

      await connection.query(db.serialize(insertBuilder, {}).sql);
      logger.debug(`Granted role: ${roleName} for system to account: ${accountId}`);
    }

    async function grantSystemRole(accountId, roleName, meta) {
      await db.withTransaction(async connection => {
        await _grantSystemRole(connection, accountId, roleName, meta);
      });

      return getAccount(accountId);
    }

    async function revokeSystemRole(accountId, roleName, meta) {
      logger.debug(`Revoking system role: ${roleName} from account: ${accountId}`);
      await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
        .select('r.id role_id')
        .from('role r')
        .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        const canRevokeAnswer = await _checkCanGrantSystem(connection, meta.account, role_id);
        if (!canRevokeAnswer) throw new Error(`User ${meta.account.id} cannot revoke system role ${roleName}.`);

        const builder = sqb
          .update('account_roles', {
            deleted_on: meta.date,
            deleted_by: meta.account.id,
          })
          .where(Op.eq('account', accountId))
          .where(Op.in('subject_type', ['global', 'system']))
          .where(Op.eq('role', role_id))
          .where(Op.is('deleted_on', null));

        await connection.query(db.serialize(builder, {}).sql);
      });

      logger.debug(`Revoked system role: ${roleName} from account: ${accountId}`);
    }

    async function grantRoleOnRegistry(accountId, roleName, registryId, meta) {
      await db.withTransaction(async connection => {
        return _grantRoleOnRegistry(connection, accountId, roleName, registryId, meta);
      });

      return getAccount(accountId);
    }

    async function _grantRoleOnRegistry(connection, accountId, roleName, registryId, meta) {
      logger.debug(`Granting role: ${roleName} on registry: ${registryId} to account: ${accountId}`);

      const roleIdBuilder = sqb
        .select('r.id role_id')
        .from('role r')
        .where(Op.eq('r.name', roleName));

      const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
      if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
      const { role_id } = roleIdResult.rows[0];

      const canGrantBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from(sqb
          .select('id')
            .from(authz.queryRegistryRolesGrantableAsSeenBy(meta.account.id, registryId).as('roles'))
            .where(Op.eq('id', role_id))
            .as('contains')
          );

      const canGrantResult = await connection.query(db.serialize(canGrantBuilder, {}).sql);
      const { answer: canGrantAnswer } = canGrantResult.rows[0];
      if (!canGrantAnswer) throw new Error(`User ${meta.account.id} cannot grant registry role ${roleName}.`);

      const existsBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', accountId))
        .where(Op.eq('ar.subject_type', 'registry'))
        .where(Op.eq('ar.subject', registryId))
        .where(Op.eq('ar.role', role_id));

      const existsResult = await connection.query(db.serialize(existsBuilder, {}).sql);
      const { answer } = existsResult.rows[0];
      if (answer) return;

      const insertBuilder = sqb
        .insert('account_roles', {
          id: uuid(),
          account: accountId,
          role: role_id,
          subject: registryId,
          subject_type: 'registry',
          created_by: meta.account.id,
          created_on: meta.date,
        });

      await connection.query(db.serialize(insertBuilder, {}).sql);

      logger.debug(`Granted role: ${roleName} on registry: ${registryId} to account: ${accountId}`);
    }

    async function revokeRoleOnRegistry(accountId, roleName, registryId, meta) {
      logger.debug(`Revoking role: ${roleName} on registry: ${registryId} to account: ${accountId}`);

      await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        const canRevokeBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from(sqb
          .select('id')
          .from(authz.queryRegistryRolesGrantableAsSeenBy(meta.account.id, registryId).as('roles'))
          .where(Op.eq('id', role_id))
          .as('contains')
        );

        const canRevokeResult = await connection.query(db.serialize(canRevokeBuilder, {}).sql);
        const { answer: canRevokeAnswer } = canRevokeResult.rows[0];
        if (!canRevokeAnswer) throw new Error(`User ${meta.account.id} cannot revoke registry role ${roleName}.`);

        const builder = sqb
        .update('account_roles', {
          deleted_on: meta.date,
          deleted_by: meta.account.id,
        })
        .where(Op.eq('account', accountId))
        .where(Op.eq('subject_type', 'registry'))
        .where(Op.eq('subject', registryId))
        .where(Op.eq('role', role_id))
        .where(Op.is('deleted_on', null));

        await connection.query(db.serialize(builder, {}).sql);
      });

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

      const roleIdBuilder = sqb
        .select('r.id role_id')
        .from('role r')
        .where(Op.eq('r.name', roleName));

      const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
      if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
      const { role_id } = roleIdResult.rows[0];

      const canGrantBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from(sqb
          .select('id')
            .from(authz.queryNamespaceRolesGrantableAsSeenBy(meta.account.id, namespaceId).as('roles'))
            .where(Op.eq('id', role_id))
            .as('contains')
          );

      const canGrantResult = await connection.query(db.serialize(canGrantBuilder, {}).sql);
      const { answer: canGrantAnswer } = canGrantResult.rows[0];
      if (!canGrantAnswer) throw new Error(`User ${meta.account.id} cannot grant namespace role ${roleName}.`);

      const existsBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', accountId))
        .where(Op.eq('ar.subject_type', 'namespace'))
        .where(Op.eq('ar.subject', namespaceId))
        .where(Op.eq('ar.role', role_id));

      const existsResult = await connection.query(db.serialize(existsBuilder, {}).sql);
      const { answer } = existsResult.rows[0];
      if (answer) return;

      const insertBuilder = sqb
        .insert('account_roles', {
          id: uuid(),
          account: accountId,
          role: role_id,
          subject: namespaceId,
          subject_type: 'namespace',
          created_by: meta.account.id,
          created_on: meta.date,
        });

      await connection.query(db.serialize(insertBuilder, {}).sql);

      logger.debug(`Granted role: ${roleName} on namespace: ${namespaceId} to account: ${accountId}`);
    }

    async function revokeRoleOnNamespace(accountId, roleName, namespaceId, meta) {
      logger.debug(`Revoking role: ${roleName} on namespace: ${namespaceId} to account: ${accountId}`);

      await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        const canRevokeBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from(sqb
          .select('id')
          .from(authz.queryNamespaceRolesGrantableAsSeenBy(meta.account.id, namespaceId).as('roles'))
          .where(Op.eq('id', role_id))
          .as('contains')
        );

        const canRevokeResult = await connection.query(db.serialize(canRevokeBuilder, {}).sql);
        const { answer: canRevokeAnswer } = canRevokeResult.rows[0];
        if (!canRevokeAnswer) throw new Error(`User ${meta.account.id} cannot revoke namespace role ${roleName}.`);

        const builder = sqb
        .update('account_roles', {
          deleted_on: meta.date,
          deleted_by: meta.account.id,
        })
        .where(Op.eq('account', accountId))
        .where(Op.eq('subject_type', 'namespace'))
        .where(Op.eq('subject', namespaceId))
        .where(Op.eq('role', role_id))
        .where(Op.is('deleted_on', null));

        await connection.query(db.serialize(builder, {}).sql);
      });

      logger.debug(`Revoked role: ${roleName} on namespace: ${namespaceId} to account: ${accountId}`);

      return getAccount(accountId);
    }

    async function _countActiveAdminstrators(connection) {
      logger.debug('Counting active administrators');

      const builder = sqb
        .select(raw('count(1) count'))
        .from('active_account_roles__vw ar')
        .join(sqb.join('role r').on(Op.eq('ar.role', raw('r.id'))))
        .where(Op.eq('r.name', 'admin'))
        .where(Op.eq('ar.subject_type', 'global'))
        .where(Op.ne('ar.account', '00000000-0000-0000-0000-000000000000'));

      const result = await db.query(db.serialize(builder, {}).sql);
      const { count } = result.rows[0];

      logger.debug(`Found ${count} active administrator accounts`);

      return parseInt(count, 10);
    }

    async function hasPermission(user, permission) {
      logger.debug(`Checking if user ${user.id} has permission ${permission}`);

      const accountRoleBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', user.id))
        .where(Op.in('ar.role', authz.queryRoleIdsWithPermission(permission)))
        .where(Op.or(
          Op.eq('ar.subject_type', 'global'),
          Op.eq('ar.subject_type', 'system')
        ));

        return db.withTransaction(async connection => {
          const result = await connection.query(db.serialize(accountRoleBuilder, {}).sql);
          const { answer } =  result.rows[0];

          logger.debug(`User ${user.id} ${answer ? 'does' : 'does not'} have permission ${permission}`);

          return answer;
        });
    }

    async function hasPermissionOnNamespace(user, namespaceId, permission) {
      logger.debug(`Checking if user ${user.id} has permission ${permission} on namespace ${namespaceId}`);

      const builder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', user.id))
        .where(Op.or(
          Op.and(
            Op.eq('ar.subject', namespaceId),
            Op.eq('ar.subject_type', 'namespace'),
          ),
          Op.eq('ar.subject_type', 'global')
        ))
        .where(Op.in('ar.role', authz.queryRoleIdsWithPermission(permission)));

      const result = await db.query(db.serialize(builder, {}).sql);
      const { answer } = result.rows[0];
      logger.debug(`User ${user.id} ${answer ? 'does' : 'does not'} have permission ${permission} on namespace ${namespaceId}`);
      return answer;
    }

    async function hasPermissionOnRegistry(user, registryId, permission) {
      logger.debug(`Checking if user ${user.id} has permission ${permission} on registry ${registryId}`);

      const builder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', user.id))
        .where(Op.or(
          Op.and(
            Op.eq('ar.subject', registryId),
            Op.eq('ar.subject_type', 'registry'),
          ),
          Op.eq('ar.subject_type', 'global')
        ))
        .where(Op.in('ar.role', authz.queryRoleIdsWithPermission(permission)));

      const result = await db.query(db.serialize(builder, {}).sql);
      const { answer } = result.rows[0];
      logger.debug(`User ${user.id} ${answer ? 'does' : 'does not'} have permission ${permission} on registry ${registryId}`);
      return answer;
    }

    async function hasPermissionOnAnyOfSubjectType(user, subjectType, permission) {
      logger.debug(`Checking if user ${user.id} has permission ${permission} on any subjects of type ${subjectType}`);

      const builder = sqb
        .select(raw('count(1) > 0 answer'))
        .from('active_account_roles__vw ar')
        .where(Op.eq('ar.account', user.id))
        .where(Op.or(
          Op.eq('ar.subject_type', subjectType),
          Op.eq('ar.subject_type', 'global')
        ))
        .where(Op.in('ar.role', authz.queryRoleIdsWithPermission(permission)));

        const result = await db.query(db.serialize(builder, {}).sql);
        const { answer } = result.rows[0];
        logger.debug(`User ${user.id} ${answer ? 'does' : 'does not'} have permission ${permission} on any subjects of type ${subjectType}`);
        return answer;
    }

    async function rolesForRegistries(targetUserId, currentUser) {
      logger.debug(`Collection registry role information for user ${targetUserId} as seen by ${currentUser.id}`);
      return db.withTransaction(async connection => {
        const appliedRolesBuilder = authz.queryRegistriesWithAppliedRolesForUserAsSeenBy(targetUserId, currentUser.id);

        const registriesWithoutRolesBuilder = sqb
          .select('sr.id registry_id', 'sr.name registry_name')
          .from('active_registry__vw sr')
          .where(Op.in('sr.id', authz.querySubjectIdsWithPermission('registry', currentUser.id, 'registries-grant')))
          .where(Op.notIn('sr.id', sqb
            .select('registry_id')
            .from(appliedRolesBuilder.as('applied'))
          ))
          .orderBy('sr.name');

        const rolesGrantablePerSubject = sqb // Grab ids + roles-array of whats grantable per subject
          .select('arr.subject id', raw('array_agg(distinct r2.name) roles'))
          .from('active_account_roles__vw arr')
          .join(sqb.join('active_registry__vw sr').on(Op.eq('sr.id', raw('arr.subject'))))
          .join(sqb.join('role r').on(Op.eq('arr.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('arr.subject_type', 'registry'))
          .where(Op.eq('arr.account', currentUser.id))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('registries-grant')))
          .groupBy('arr.subject');

        const rolesGrantableFromGlobal = sqb
          .select('sr.id id', raw('array_agg(distinct r2.name) roles'))
          .from('active_account_roles__vw arr')
          .join(sqb.join('active_registry__vw sr').on(Op.eq('arr.subject_type', 'global')))
          .join(sqb.join('role r').on(Op.eq('arr.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('arr.account', currentUser.id))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('registries-grant')))
          .groupBy('sr.id');

        const rolesGrantableBuilder = sqb
          .select(
            raw('COALESCE (s.id, g.id) id'),
            sqb
              .select(raw('array_agg(distinct role)'))
              .from(
                sqb.select(raw('UNNEST (s.roles || g.roles) as role')).as('concat') // postgres doesn't have unique for arrays
              ).as('roles')
          )
          // Join the two together with a fullOuterJoin so as to work for having empty from either.
          .from(rolesGrantablePerSubject.as('s'))
          .join(sqb.fullOuterJoin(rolesGrantableFromGlobal.as('g')).on(Op.eq('s.id', raw('g.id'))));

        const currentRolesResult = await connection.query(db.serialize(appliedRolesBuilder, {}).sql);
        const registriesWithoutRolesResult = await connection.query(db.serialize(registriesWithoutRolesBuilder, {}).sql);
        const rolesGrantable = await connection.query(db.serialize(rolesGrantableBuilder, {}).sql);

        return {
          currentRoles: currentRolesResult.rows.map(row => ({
            registry: new Registry({
              id: row.registry_id,
              name: row.registry_name,
            }),
            roles: row.roles,
          })),
          registriesWithoutRoles: registriesWithoutRolesResult.rows.map(row => (
            new Registry({
              id: row.registry_id,
              name: row.registry_name,
            })
          )),
          rolesGrantable: rolesGrantable.rows,
        };
      });
    }

    async function rolesForNamespaces(targetUserId, currentUser) {
      logger.debug(`Collection namespace role information for user ${targetUserId} as seen by ${currentUser.id}`);
      return db.withTransaction(async connection => {
        const appliedRolesBuilder = authz.queryNamespacesWithAppliedRolesForUserAsSeenBy(targetUserId, currentUser.id);

        const namespacesWithoutRolesBuilder = sqb
          .select('n.id namespace_id', 'c.name cluster_name', 'n.name namespace_name')
          .from('active_namespace__vw n')
          .join(sqb.join('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id'))))
          .where(Op.in('n.id', authz.querySubjectIdsWithPermission('namespace', currentUser.id, 'namespaces-grant')))
          .where(Op.notIn('n.id', sqb
            .select('namespace_id')
            .from(appliedRolesBuilder.as('applied'))
          ))
          .orderBy('c.priority', 'c.name', 'n.name');

        const rolesGrantablePerSubject = sqb // Grab ids + roles-array of whats grantable per subject
          .select('arn.subject id', raw('array_agg(distinct r2.name) roles'))
          .from('active_account_roles__vw arn')
          .join(sqb.join('active_namespace__vw n').on(Op.eq('n.id', raw('arn.subject'))))
          .join(sqb.join('role r').on(Op.eq('arn.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('arn.subject_type', 'namespace'))
          .where(Op.eq('arn.account', currentUser.id))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('namespaces-grant')))
          .groupBy('arn.subject');

        const rolesGrantableFromGlobal = sqb
          .select('n.id id', raw('array_agg(distinct r2.name) roles'))
          .from('active_account_roles__vw arn')
          .join(sqb.join('active_namespace__vw n').on(Op.eq('arn.subject_type', 'global')))
          .join(sqb.join('role r').on(Op.eq('arn.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('arn.account', currentUser.id))
          .where(Op.is('arn.deleted_on', null))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('namespaces-grant')))
          .groupBy('n.id');

        const rolesGrantableBuilder = sqb
          .select(
            raw('COALESCE (s.id, g.id) id'),
            sqb
              .select(raw('array_agg(distinct role)'))
              .from(
                sqb.select(raw('UNNEST (s.roles || g.roles) as role')).as('concat') // postgres doesn't have unique for arrays
              ).as('roles')
          )
          // Join the two together with a fullOuterJoin so as to work for having empty from either.
          .from(rolesGrantablePerSubject.as('s'))
          .join(sqb.fullOuterJoin(rolesGrantableFromGlobal.as('g')).on(Op.eq('s.id', raw('g.id'))));

        const currentRolesResult = await connection.query(db.serialize(appliedRolesBuilder, {}).sql);
        const namespacesWithoutRolesResult = await connection.query(db.serialize(namespacesWithoutRolesBuilder, {}).sql);
        const rolesGrantable = await connection.query(db.serialize(rolesGrantableBuilder, {}).sql);

        return {
          currentRoles: currentRolesResult.rows.map(row => ({
            namespace: new Namespace({
              id: row.namespace_id,
              name: row.namespace_name,
              cluster: new Cluster({ name: row.cluster_name }),
            }),
            roles: row.roles,
          })),
          namespacesWithoutRoles: namespacesWithoutRolesResult.rows.map(row => (
            new Namespace({
              id: row.namespace_id,
              name: row.namespace_name,
              cluster: new Cluster({ name: row.cluster_name }),
            })
          )),
          rolesGrantable: rolesGrantable.rows,
        };
      });
    }

    async function rolesForSystem(targetUserId, currentUser) {
      logger.debug(`Collection system role information for user ${targetUserId} as seen by ${currentUser.id}`);

      return db.withTransaction(async connection => {
        const appliedRolesBuilder = authz.querySystemAppliedRolesForUser(targetUserId);
        const rolesGrantableBuilder = authz.querySystemRolesGrantableAsSeenBy(currentUser.id);
        const globalGrantableBuilder = authz.queryGlobalRolesGrantableAsSeenBy(targetUserId, currentUser.id);

        const currentRolesResult = await connection.query(db.serialize(appliedRolesBuilder, {}).sql);
        const rolesGrantable = await connection.query(db.serialize(rolesGrantableBuilder, {}).sql);
        const globalGrantable = await connection.query(db.serialize(globalGrantableBuilder, {}).sql);

        return {
          currentRoles: currentRolesResult.rows,
          rolesGrantable: rolesGrantable.rows.map(({ name }) => (name)),
          globalGrantable: globalGrantable.rows.map(({ name }) => (name)),
        };
      });
    }

    function toAccount(row) {
      return new Account({
        id: row.id,
        displayName: row.display_name,
        avatar: row.avatar,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
      });
    }

    return cb(null, {
      saveAccount,
      ensureAccount,
      getAccount,
      getRolesForAccount,
      findAccount,
      findAccounts,
      deleteAccount,
      saveIdentity,
      deleteIdentity,
      grantRoleOnRegistry,
      revokeRoleOnRegistry,
      grantRoleOnNamespace,
      revokeRoleOnNamespace,
      hasPermissionOnNamespace,
      hasPermissionOnRegistry,
      hasPermissionOnAnyOfSubjectType,
      hasPermission,
      rolesForNamespaces,
      rolesForRegistries,
      rolesForSystem,
      grantGlobalRole,
      grantSystemRole,
      revokeGlobalRole,
      revokeSystemRole,
      checkCanGrantSystem,
      checkCanRevokeSystem,
      checkCanGrantGlobal,
      checkCanRevokeGlobal,
    });
  }

  return {
    start,
  };
}
