import sqb from 'sqb';

const {
  Op,
  raw
} = sqb;

export default {
  async start({ logger, db }) {
    function queryRoleIdsWithPermission(permission) {
      return sqb
        .select('r.id')
        .from('role_permission rp')
        .join(sqb.join('permission p').on(Op.eq('p.id', raw('rp.permission'))))
        .join(sqb.join('role r').on(Op.eq('r.id', raw('rp.role'))))
        .where(Op.eq('p.name', permission));
    }

    async function queryRegistryIdsWithPermission(connection, userId, permission) {
      const hasNullSubjectEntry = sqb // Preserve the bug/feature of null subject => apply to all
        .select(raw('count(1) > 0 answer'))
        .from('account_role_registry arr')
        .where(Op.is('arr.deleted_on', null))
        .where(Op.eq('arr.account', userId))
        .where(Op.in('arr.role', queryRoleIdsWithPermission(permission)))
        .where(Op.is('arr.subject', null));

      const nullSubjectResult = await connection.query(db.serialize(hasNullSubjectEntry, {}).sql);
      if (nullSubjectResult.rows[0].answer) {
        const allRegistryIdsBuilder = sqb
          .select('r.id')
          .from('active_registry__vw r');

        return allRegistryIdsBuilder;
      }

      const registryIdsWithPermissionBuilder = sqb
        .select('r.id')
        .from('active_registry__vw r')
        .where(Op.in('r.id', sqb
          .select('arr.subject')
          .from('account_role_registry arr')
          .where(Op.is('arr.deleted_on', null))
          .where(Op.eq('arr.account', userId))
          .where(Op.in('arr.role', queryRoleIdsWithPermission(permission)))
          .where(Op.not('subject', null))
        ));

      return registryIdsWithPermissionBuilder;
    }

    async function queryNamespaceIdsWithPermission(connection, userId, permission) {
      const hasNullSubjectEntry = sqb // Preserve the bug/feature of null subject => apply to all
        .select(raw('count(1) > 0 answer'))
        .from('account_role_namespace arn')
        .where(Op.is('arn.deleted_on', null))
        .where(Op.eq('arn.account', userId))
        .where(Op.in('arn.role', queryRoleIdsWithPermission(permission)))
        .where(Op.is('arn.subject', null));

      const nullSubjectResult = await connection.query(db.serialize(hasNullSubjectEntry, {}).sql);

      if (nullSubjectResult.rows[0].answer) {
        const allNamespaceIdsBuilder = sqb
          .select('r.id')
          .from('active_namespace__vw r');

        return allNamespaceIdsBuilder;
      }

      const namespaceIdsWithPermissionBuilder = sqb
        .select('r.id')
        .from('active_namespace__vw r')
        .where(Op.in('r.id', sqb
          .select('arn.subject')
          .from('account_role_namespace arn')
          .where(Op.is('arn.deleted_on', null))
          .where(Op.eq('arn.account', userId))
          .where(Op.in('arn.role', queryRoleIdsWithPermission(permission)))
          .where(Op.not('subject', null))
        ));

      return namespaceIdsWithPermissionBuilder;
    }


    return {
      queryRegistryIdsWithPermission,
      queryNamespaceIdsWithPermission,
      queryRoleIdsWithPermission,
    };
  }
};
