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

    function querySubjectIdsWithPermission(subjectType, userId, permission) {
      const builder = sqb
        .select('sub.id')
        .from(`${subjectType === 'registry' ? 'active_registry__vw' : 'active_namespace__vw'} sub`)
        .where(
          Op.or(
            Op.eq(
              sqb
                .select(raw('count(1) > 0 answer'))
                .from('active_account_roles__vw ar')
                .where(Op.eq('ar.account', userId))
                .where(Op.in('ar.role', queryRoleIdsWithPermission(permission)))
                .where(Op.eq('ar.subject_type', 'global')),
              true
            ),
            Op.in('sub.id', sqb
              .select('ar.subject')
              .from('active_account_roles__vw ar')
              .where(Op.eq('subject_type', subjectType))
              .where(Op.eq('ar.account', userId))
              .where(Op.in('ar.role', queryRoleIdsWithPermission(permission)))
            )
          )
        );

      return builder;
    }

    function queryNamespacesWithAppliedRolesForUserAsSeenBy(targetUserId, currentUserId) {
      return sqb
        .select('n.id namespace_id', 'c.name cluster_name', 'n.name namespace_name', raw('array_agg(r.name) roles'))
        .from('active_account_roles__vw arn')
        .join(sqb.join('active_namespace__vw n').on(Op.eq('arn.subject', raw('n.id'))))
        .join(sqb.join('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id'))))
        .join(sqb.join('role r').on(Op.eq('arn.role', raw('r.id'))))
        .where(Op.eq('arn.subject_type', 'namespace'))
        .where(Op.eq('arn.account', targetUserId))
        .where(Op.in('n.id', querySubjectIdsWithPermission('namespace', currentUserId, 'namespaces-read')))
        .groupBy('n.id', 'c.name', 'n.name')
        .orderBy('c.name', 'n.name');
    }

    function queryRegistriesWithAppliedRolesForUserAsSeenBy(targetUserId, currentUserId) {
      return sqb
        .select('sr.id registry_id', 'sr.name registry_name', raw('array_agg(r.name) roles'))
        .from('active_account_roles__vw arr')
        .join(sqb.join('active_registry__vw sr').on(Op.eq('arr.subject', raw('sr.id'))))
        .join(sqb.join('role r').on(Op.eq('arr.role', raw('r.id'))))
        .where(Op.eq('arr.subject_type', 'registry'))
        .where(Op.eq('arr.account', targetUserId))
        .where(Op.in('sr.id', querySubjectIdsWithPermission('registry', currentUserId, 'registries-read')))
        .groupBy('sr.id', 'sr.name')
        .orderBy('sr.name');
    }

    return {
      querySubjectIdsWithPermission,
      queryRoleIdsWithPermission,
      queryNamespacesWithAppliedRolesForUserAsSeenBy,
      queryRegistriesWithAppliedRolesForUserAsSeenBy,
    };
  }
};
