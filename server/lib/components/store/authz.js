import sqb from 'sqb';

const {
  Op,
  raw
} = sqb;

export default {
  async start({ logger, db }) {
    function roleIdsWithPermissionBuilder(permission) {
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
        .from('account_role_registry acr')
        .where(Op.is('acr.deleted_on', null))
        .where(Op.eq('acr.account', userId))
        .where(Op.in('acr.role', roleIdsWithPermissionBuilder(permission)))
        .where(Op.is('acr.subject', null));

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
          .select('acr.subject')
          .from('account_role_registry acr')
          .where(Op.is('acr.deleted_on', null))
          .where(Op.eq('acr.account', userId))
          .where(Op.in('acr.role', roleIdsWithPermissionBuilder(permission)))
          .where(Op.not('subject', null))
        ));

      return registryIdsWithPermissionBuilder;
    }


    return {
      queryRegistryIdsWithPermission,
    };
  }
};
