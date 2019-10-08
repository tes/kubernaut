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

    function queryTeamsForAccount(userId) {
      return sqb
        .select('ta.team')
        .from('active_team_account__vw ta')
        .where(Op.eq('ta.account', userId));
    }

    const subjectTypeViewLookup = {
      registry: 'active_registry__vw',
      namespace: 'active_namespace__vw',
      team: 'active_team__vw',
    };
    function querySubjectIdsWithPermission(subjectType, userId, permission) {
      const builder = sqb
        .select('sub.id')
        .from(`${subjectTypeViewLookup[subjectType]} sub`)
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
            Op.eq(
              sqb
                .select(raw('count(1) > 0 answer'))
                .from('active_team_roles__vw tr')
                .where(Op.in('tr.team', queryTeamsForAccount(userId)))
                .where(Op.in('tr.role', queryRoleIdsWithPermission(permission)))
                .where(Op.eq('tr.subject_type', 'global')),
              true
            ),
            Op.in('sub.id', sqb
              .select('ar.subject')
              .from('active_account_roles__vw ar')
              .where(Op.eq('subject_type', subjectType))
              .where(Op.eq('ar.account', userId))
              .where(Op.in('ar.role', queryRoleIdsWithPermission(permission)))
            ),
            Op.in('sub.id', sqb
              .select('tr.subject')
              .from('active_team_roles__vw tr')
              .where(Op.eq('subject_type', subjectType))
              .where(Op.in('tr.team', queryTeamsForAccount(userId)))
              .where(Op.in('tr.role', queryRoleIdsWithPermission(permission)))
            ),
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
        .groupBy('n.id', 'c.priority', 'c.name', 'n.name')
        .orderBy('c.priority', 'c.name', 'n.name');
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

    function queryTeamsWithAppliedRolesForUserAsSeenBy(targetUserId, currentUserId) {
      return sqb
        .select('t.id team_id', 't.name team_name', raw('array_agg(r.name) roles'))
        .from('active_account_roles__vw arr')
        .join(sqb.join('active_team__vw t').on(Op.eq('arr.subject', raw('t.id'))))
        .join(sqb.join('role r').on(Op.eq('arr.role', raw('r.id'))))
        .where(Op.eq('arr.subject_type', 'registry'))
        .where(Op.eq('arr.account', targetUserId))
        .where(Op.in('t.id', querySubjectIdsWithPermission('team', currentUserId, 'teams-read')))
        .groupBy('t.id', 't.name')
        .orderBy('t.name');
    }

    function querySystemAppliedRolesForUser(targetUserId) {
      return sqb
        .select('r.name', raw('gar.id IS NOT NULL as global'))
        .from('active_account_roles__vw ar')
        .join(
          sqb.leftJoin('active_account_roles__vw gar')
          .on(Op.eq('ar.account', raw('gar.account')))
          .on(Op.eq('ar.subject_type', 'system'))
          .on(Op.eq('gar.subject_type', 'global'))
          .on(Op.eq('ar.role', raw('gar.role')))
        )
        .join(sqb.join('role r').on(Op.eq('r.id', raw('ar.role'))))
        .where(Op.eq('ar.account', targetUserId))
        .where(Op.eq('ar.subject_type', 'system'))
        .orderBy('r.priority desc');
    }

    function querySystemRolesGrantableAsSeenBy(currentUserId) {
      const accountBuilder = sqb
          .select(raw('max(applied.priority)'))
          .from('active_account_roles__vw ar')
          .join(sqb.join('role applied').on(Op.eq('ar.role', raw('applied.id'))))
          .where(Op.eq('ar.account', currentUserId))
          .where(Op.eq('ar.subject_type', 'system'))
          .where(Op.in('ar.role', queryRoleIdsWithPermission('accounts-write')));

      const teamBuilder = sqb
          .select(raw('max(applied.priority)'))
          .from('active_team_roles__vw tr')
          .join(sqb.join('role applied').on(Op.eq('tr.role', raw('applied.id'))))
          .where(Op.in('tr.team', queryTeamsForAccount(currentUserId)))
          .where(Op.eq('tr.subject_type', 'system'))
          .where(Op.in('tr.role', queryRoleIdsWithPermission('accounts-write')));

      return sqb
        .select('r.id', 'r.name')
        .from('role r')
        .where(Op.lte('r.priority', raw(`GREATEST((${db.serialize(accountBuilder).sql}), (${db.serialize(teamBuilder).sql}))`)))
        .orderBy('r.priority desc');
    }

    function queryGlobalRolesGrantableAsSeenBy(targetUserId, currentUserId) {
      const accountBuilder = sqb
        .select(raw('max(applied.priority)'))
        .from('active_account_roles__vw ar')
        .join(sqb.join('role applied').on(Op.eq('ar.role', raw('applied.id'))))
        .where(Op.eq('ar.account', currentUserId))
        .where(Op.ne('ar.account', targetUserId))
        .where(Op.eq('ar.subject_type', 'global'))
        .where(Op.in('ar.role', queryRoleIdsWithPermission('accounts-write')));

      const teamBuilder = sqb
        .select(raw('max(applied.priority)'))
        .from('active_team_roles__vw tr')
        .join(sqb.join('role applied').on(Op.eq('tr.role', raw('applied.id'))))
        .where(Op.in('tr.team', queryTeamsForAccount(currentUserId)))
        .where(Op.ne(raw(`'${currentUserId}'`), targetUserId))
        .where(Op.eq('tr.subject_type', 'global'))
        .where(Op.in('tr.role', queryRoleIdsWithPermission('accounts-write')));

      return sqb
        .select('r.id', 'r.name')
        .from('role r')
        .where(Op.lte('r.priority', raw(`GREATEST((${db.serialize(accountBuilder).sql}), (${db.serialize(teamBuilder).sql}))`)))
        .orderBy('r.priority desc');
    }

    function queryNamespaceRolesGrantableAsSeenBy(currentUserId, namespaceId) {
      const accountBuilder = sqb
        .select(raw('max(applied.priority)'))
        .from('active_account_roles__vw ar')
        .join(sqb.join('role applied').on(Op.eq('ar.role', raw('applied.id'))))
        .where(Op.eq('ar.account', currentUserId))
        .where(Op.in('ar.role', queryRoleIdsWithPermission('namespaces-grant')))
        .where(Op.or(
          Op.eq('ar.subject_type', 'global'),
          Op.and(
            Op.eq('ar.subject_type', 'namespace'),
            Op.eq('ar.subject', namespaceId)
          )
        ));

      const teamBuilder = sqb
        .select(raw('max(applied.priority)'))
        .from('active_team_roles__vw tr')
        .join(sqb.join('role applied').on(Op.eq('tr.role', raw('applied.id'))))
        .where(Op.in('tr.team', queryTeamsForAccount(currentUserId)))
        .where(Op.in('tr.role', queryRoleIdsWithPermission('namespaces-grant')))
        .where(Op.or(
          Op.eq('tr.subject_type', 'global'),
          Op.and(
            Op.eq('tr.subject_type', 'namespace'),
            Op.eq('tr.subject', namespaceId)
          )
        ));

      return sqb
        .select('r.id')
        .from('role r')
        .where(Op.lte('r.priority', raw(`GREATEST((${db.serialize(accountBuilder).sql}), (${db.serialize(teamBuilder).sql}))`)))
        .orderBy('r.priority desc');
    }

    function queryRegistryRolesGrantableAsSeenBy(currentUserId, registryId) {
      const accountBuilder = sqb
        .select(raw('max(applied.priority)'))
        .from('active_account_roles__vw ar')
        .join(sqb.join('role applied').on(Op.eq('ar.role', raw('applied.id'))))
        .where(Op.eq('ar.account', currentUserId))
        .where(Op.in('ar.role', queryRoleIdsWithPermission('registries-grant')))
        .where(Op.or(
          Op.eq('ar.subject_type', 'global'),
          Op.and(
            Op.eq('ar.subject_type', 'registry'),
            Op.eq('ar.subject', registryId)
          )
        ));

      const teamBuilder = sqb
        .select(raw('max(applied.priority)'))
        .from('active_team_roles__vw tr')
        .join(sqb.join('role applied').on(Op.eq('tr.role', raw('applied.id'))))
        .where(Op.in('tr.team', queryTeamsForAccount(currentUserId)))
        .where(Op.in('tr.role', queryRoleIdsWithPermission('registries-grant')))
        .where(Op.or(
          Op.eq('tr.subject_type', 'global'),
          Op.and(
            Op.eq('tr.subject_type', 'registry'),
            Op.eq('tr.subject', registryId)
          )
        ));

      return sqb
        .select('r.id')
        .from('role r')
        .where(Op.lte('r.priority', raw(`GREATEST((${db.serialize(accountBuilder).sql}), (${db.serialize(teamBuilder).sql}))`)))
        .orderBy('r.priority desc');
    }

    function queryTeamRolesGrantableAsSeenBy(currentUserId, teamId) {
      const accountBuilder = sqb
        .select(raw('max(applied.priority)'))
        .from('active_account_roles__vw ar')
        .join(sqb.join('role applied').on(Op.eq('ar.role', raw('applied.id'))))
        .where(Op.eq('ar.account', currentUserId))
        .where(Op.in('ar.role', queryRoleIdsWithPermission('teams-manage')))
        .where(Op.or(
          Op.eq('ar.subject_type', 'global'),
          Op.and(
            Op.eq('ar.subject_type', 'team'),
            Op.eq('ar.subject', teamId)
          )
        ));

      const teamBuilder = sqb
        .select(raw('max(applied.priority)'))
        .from('active_team_roles__vw tr')
        .join(sqb.join('role applied').on(Op.eq('tr.role', raw('applied.id'))))
        .where(Op.in('tr.team', queryTeamsForAccount(currentUserId)))
        .where(Op.in('tr.role', queryRoleIdsWithPermission('teams-manage')))
        .where(Op.or(
          Op.eq('tr.subject_type', 'global'),
          Op.and(
            Op.eq('tr.subject_type', 'team'),
            Op.eq('tr.subject', teamId)
          )
        ));

      return sqb
        .select('r.id')
        .from('role r')
        .where(Op.lte('r.priority', raw(`GREATEST((${db.serialize(accountBuilder).sql}), (${db.serialize(teamBuilder).sql}))`)))
        .orderBy('r.priority desc');
    }

    return {
      querySubjectIdsWithPermission,
      queryRoleIdsWithPermission,
      queryTeamsForAccount,
      queryNamespacesWithAppliedRolesForUserAsSeenBy,
      queryRegistriesWithAppliedRolesForUserAsSeenBy,
      queryTeamsWithAppliedRolesForUserAsSeenBy,
      querySystemAppliedRolesForUser,
      querySystemRolesGrantableAsSeenBy,
      queryNamespaceRolesGrantableAsSeenBy,
      queryRegistryRolesGrantableAsSeenBy,
      queryTeamRolesGrantableAsSeenBy,
      queryGlobalRolesGrantableAsSeenBy,
    };
  }
};
