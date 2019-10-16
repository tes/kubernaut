import sqb from 'sqb';
import { v4 as uuid } from 'uuid';
import Promise from 'bluebird';
import Team from '../../domain/Team';
import Service from '../../domain/Service';
import Registry from '../../domain/Registry';
import Account from '../../domain/Account';
import Namespace from '../../domain/Namespace';
import Cluster from '../../domain/Cluster';


const { Op, raw, innerJoin } = sqb;

export default function(options) {
  function start({ config, logger, db, authz }, cb) {

    function getTeam(id, user) {
      logger.debug(`Getting team by id ${id}`);

      return db.withTransaction(connection => {
        return _getTeam(connection, id, user);
      });
    }

    async function _getTeam(connection, id, user) {
      logger.debug(`Getting team by id ${id}`);

      const teamBuilder = sqb
        .select('t.id', 't.name', 't.created_on', 't.created_by', 'a.display_name')
        .from('active_team__vw t', 'active_account__vw a')
        .where(Op.eq('t.created_by', raw('a.id')))
        .where(Op.eq('t.id', id));

      const attributeBuilder = sqb
        .select('ta.name', 'ta.value')
        .from('team_attribute ta', 'active_team__vw t')
        .where(Op.eq('ta.team', raw('t.id')))
        .where(Op.eq('ta.team', id));


      const servicesBuilder = sqb
        .select('s.id service_id', 's.name service_name', 'sr.id registry_id', 'sr.name registry_name')
        .from('active_team__vw t', 'team_service ts', 'active_service__vw s', 'active_registry__vw sr')
        .where(Op.eq('t.id', raw('ts.team')))
        .where(Op.eq('ts.service', raw('s.id')))
        .where(Op.eq('s.registry', raw('sr.id')))
        .where(Op.eq('t.id', id))
        .orderBy('s.name');

      if (user) {
        const idsQuery = authz.querySubjectIdsWithPermission('registry', user.id, user.permission);
        servicesBuilder.where(Op.in('sr.id', idsQuery));
      }

      const [teamResult, attrsResult, servicesResult] = await Promise.all([
        connection.query(db.serialize(teamBuilder, {}).sql),
        connection.query(db.serialize(attributeBuilder, {}).sql),
        connection.query(db.serialize(servicesBuilder, {}).sql),
      ]);

      logger.debug(`Found ${teamResult.rowCount} teams with id: ${id}`);
      return teamResult.rowCount ? toTeam(teamResult.rows[0], attrsResult.rows, servicesResult.rows) : undefined;
    }

    function getTeamForService(service, user) {
      logger.debug(`Getting team for service ${service.name} ${service.id}`);

      const builder = sqb
        .select('ts.team')
        .from('team_service ts')
        .where(Op.eq('ts.service', service.id));

      return db.withTransaction(async connection => {
        const teamResult = await connection.query(db.serialize(builder, {}).sql);
        if (!teamResult.rowCount) return undefined;

        return _getTeam(connection, teamResult.rows[0].team, user);
      });
    }

    async function _getTeamAttributes(connection, ids) {
      const teamIds = [].concat(ids);
      if (!teamIds.length) return [];

      const attributeBuilder = sqb
        .select('ta.team', 'ta.name', 'ta.value')
        .from('team_attribute ta', 'active_team__vw t')
        .where(Op.eq('ta.team', raw('t.id')))
        .where(Op.in('ta.team', teamIds));

        const results = await connection.query(db.serialize(attributeBuilder, {}).sql);
        return results.rows.reduce((acc, row) => {
          if (!acc[row.team]) acc[row.team] = [];
          acc[row.team].push(row);
          return acc;
        }, {});
    }

    async function deleteTeam(id, meta) {
      logger.debug(`Deleting teamBuilder id: ${id}`);

      const builder = sqb
        .update('team', {
          deleted_on: meta.date,
          deleted_by: meta.account.id,
        })
        .where(Op.eq('id', id))
        .where(Op.is('deleted_on', null));

      await db.query(db.serialize(builder, {}).sql);

      logger.debug(`Deleted team, id: ${id}`);
    }

    async function findTeam(criteria) {
      const list = await findTeams(criteria, 1, 0);
      if (list.count > 1) throw new Error(`Expected 0 or 1 teams but found ${list.count}}`);
      return list.count === 1 ? list.items[0] : undefined;
    }

    async function findTeams(criteria = {}, limit = 50, offset = 0) {
      logger.debug(`Listing up to ${limit} teams starting from offset: ${offset}`);

      const bindVariables = {};

      const findTeamsBuilder = sqb
        .select('t.id', 't.name', 't.created_on', 't.created_by', 'a.display_name')
        .from('active_team__vw t')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('t.created_by', raw('a.id')))
        )
        .orderBy('t.name asc')
        .limit(limit)
        .offset(offset);

      const countTeamsBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_team__vw t')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('t.created_by', raw('a.id')))
        );

      if (criteria.filters) {
        if (criteria.filters.name) {
          db.applyFilter(criteria.filters.name, 't.name', findTeamsBuilder, countTeamsBuilder);
        }

        if (criteria.filters.createdBy) {
          db.applyFilter(criteria.filters.createdBy, 'a.display_name', findTeamsBuilder, countTeamsBuilder);
        }
      }

      if (criteria.user) {
        const idsQuery = authz.querySubjectIdsWithPermission('team', criteria.user.id, criteria.user.permission);
        [findTeamsBuilder, countTeamsBuilder].forEach(builder => builder.where(Op.in('t.id', idsQuery)));
      }

      return db.withTransaction(async connection => {
        const findStatement = db.serialize(findTeamsBuilder, bindVariables);
        const countStatement = db.serialize(countTeamsBuilder, bindVariables);

        const [findResult, countResult] = await Promise.all([
          connection.query(findStatement.sql, findStatement.values),
          connection.query(countStatement.sql, countStatement.values)
        ]);

        const attributes = await _getTeamAttributes(connection, findResult.rows.map(({ id }) => id));
        const items = findResult.rows.map(row => toTeam(row, attributes[row.id]));
        const count = parseInt(countResult.rows[0].count, 10);
        logger.debug(`Returning ${items.length} of ${count} teams`);

        return {
          limit,
          offset,
          count,
          items,
        };
      });
    }

    async function saveTeam(team, meta) {
      logger.debug(`Saving new team with name ${team.name} by account ${meta.account.id}`);

      return db.withTransaction(async connection => {
        const newTeamId = uuid();

        const teamBuilder = sqb
          .insert('team', {
            id: newTeamId,
            name: team.name,
            created_on: meta.date,
            created_by: meta.account.id,
          });

        await connection.query(db.serialize(teamBuilder, {}).sql);

        const attributes = team.attributes || {};
        const attrBuilders = Object.keys(attributes).map(name => sqb
        .insert('team_attribute', {
          team: newTeamId,
          name,
          value: attributes[name],
        }));

        await Promise.mapSeries(attrBuilders, async (builder) => {
          await connection.query(db.serialize(builder, {}).sql);
        });

        logger.debug(`Saved new team with id ${newTeamId}`);
        return newTeamId;
      });
    }

    async function associateServiceWithTeam(service, team) {
      logger.debug(`Associating service with id ${service.id} with team id ${team.id}`);

      const deleteBuilder = sqb
        .delete('team_service ts')
        .where(Op.eq('ts.service', service.id));

      const insertBuilder = sqb
        .insert('team_service', {
          team: team.id,
          service: service.id,
        });

      await db.withTransaction(async connection => {
        await connection.query(db.serialize(deleteBuilder, {}).sql);
        await connection.query(db.serialize(insertBuilder, {}).sql);
      });

      logger.debug(`Associated service ${service.id} with team ${team.id}`);
    }

    async function disassociateService(service) {
      logger.debug(`Disassociating service with id ${service.id}`);

      const deleteBuilder = sqb
        .delete('team_service ts')
        .where(Op.eq('ts.service', service.id));

      await db.query(db.serialize(deleteBuilder, {}).sql);
      logger.debug(`Disassociated service ${service.id}`);
    }

    async function associateAccountWithTeam(account, team, meta) {
      const selectBuilder = sqb
        .select('ta.id')
        .from('active_team_account__vw ta')
        .where(Op.eq('ta.account', account.id))
        .where(Op.eq('ta.team', team.id));

      const insertBuilder = sqb
        .insert('team_account', {
          id: uuid(),
          account: account.id,
          team: team.id,
          created_on: meta.date,
          created_by: meta.account.id,
        });

      await db.withTransaction(async connection => {
        const existsResult = await connection.query(db.serialize(selectBuilder).sql);
        if (existsResult.rowCount) return;

        return connection.query(db.serialize(insertBuilder).sql);
      });
    }

    async function disassociateAccount(account, team, meta) {
      logger.debug(`Disassociating account ${account.id} from team ${team.id}`);

      const updateBuilder = sqb
        .update('team_account ta', {
          deleted_on: meta.date,
          deleted_by: meta.account.id,
        }).where(Op.eq('ta.team', team.id))
        .where(Op.eq('ta.account', account.id))
        .where(Op.is('ta.deleted_on', null));

      await db.query(db.serialize(updateBuilder).sql);
      logger.debug(`Disassociated account ${account.id} from team ${team.id}`);
    }

    async function membershipToTeams(targetUserId, currentUser) {
      logger.debug(`Collecting team membership information for user ${targetUserId} as seen by ${currentUser.id}`);

      const membershipBuilder = sqb
        .select('t.id', 't.name')
        .from('active_team__vw t')
        .where(Op.in('t.id', authz.queryTeamsForAccount(targetUserId)))
        .where(Op.in('t.id', authz.querySubjectIdsWithPermission('team', currentUser.id, 'teams-manage')))
        .orderBy('t.name');

      const noMembershipBuilder = sqb
        .select('t.id', 't.name')
        .from('active_team__vw t')
        .where(Op.notIn('t.id', authz.queryTeamsForAccount(targetUserId)))
        .where(Op.in('t.id', authz.querySubjectIdsWithPermission('team', currentUser.id, 'teams-manage')))
        .orderBy('t.name');

      return await db.withTransaction(async connection => {
        const membershipResult = await connection.query(db.serialize(membershipBuilder).sql);
        const noMemeberResult = await connection.query(db.serialize(noMembershipBuilder).sql);

        return {
          currentMembership: membershipResult.rows.map((row) => toTeam(row)),
          noMembership: noMemeberResult.rows.map((row) => toTeam(row)),
        };
      });
    }

    async function teamRolesForNamespaces(teamId, currentUser) {
      logger.debug(`Collecting namespace role information for team ${teamId} as seen by ${currentUser.id}`);
      return db.withTransaction(async connection => {
        const appliedRolesBuilder = authz.queryNamespacesWithAppliedRolesForTeamAsSeenBy(teamId, currentUser.id);

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

        const rolesGrantablePerSubjectFromTeam = sqb // Grab ids + roles-array of whats grantable per subject
          .select('trn.subject id', raw('array_agg(distinct r2.name) roles'))
          .from('active_team_roles__vw trn')
          .join(sqb.join('active_namespace__vw n').on(Op.eq('n.id', raw('trn.subject'))))
          .join(sqb.join('role r').on(Op.eq('trn.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('trn.subject_type', 'namespace'))
          .where(Op.in('trn.team', authz.queryTeamsForAccount(currentUser.id)))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('namespaces-grant')))
          .groupBy('trn.subject');

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

        const rolesGrantableFromGlobalFromTeam = sqb
          .select('n.id id', raw('array_agg(distinct r2.name) roles'))
          .from('active_team_roles__vw trn')
          .join(sqb.join('active_namespace__vw n').on(Op.eq('trn.subject_type', 'global')))
          .join(sqb.join('role r').on(Op.eq('trn.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.in('trn.team', authz.queryTeamsForAccount(currentUser.id)))
          .where(Op.is('trn.deleted_on', null))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('namespaces-grant')))
          .groupBy('n.id');

        const rolesGrantableBuilder = sqb
          .select(
            raw('COALESCE (s.id, ts.id, g.id, tg.id) id'),
            sqb
              .select(raw('array_agg(distinct role)'))
              .from(
                sqb.select(raw('UNNEST (s.roles || ts.roles || g.roles || tg.roles) as role')).as('concat') // postgres doesn't have unique for arrays
              ).as('roles')
          )
          // Join the tables together with a fullOuterJoin so as to work for having empty from any.
          .from(rolesGrantablePerSubject.as('s'))
          .join(sqb.fullOuterJoin(rolesGrantablePerSubjectFromTeam.as('ts')).on(Op.eq('s.id', raw('ts.id'))))
          .join(sqb.fullOuterJoin(rolesGrantableFromGlobal.as('g')).on(Op.eq('s.id', raw('g.id'))))
          .join(sqb.fullOuterJoin(rolesGrantableFromGlobalFromTeam.as('tg')).on(Op.eq('s.id', raw('tg.id'))));

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

    async function teamRolesForRegistries(teamId, currentUser) {
      logger.debug(`Collecting registry role information for team ${teamId} as seen by ${currentUser.id}`);
      return db.withTransaction(async connection => {
        const appliedRolesBuilder = authz.queryRegistriesWithAppliedRolesForTeamAsSeenBy(teamId, currentUser.id);

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

        const rolesGrantablePerSubjectFromTeam = sqb // Grab ids + roles-array of whats grantable per subject
          .select('trr.subject id', raw('array_agg(distinct r2.name) roles'))
          .from('active_team_roles__vw trr')
          .join(sqb.join('active_registry__vw sr').on(Op.eq('sr.id', raw('trr.subject'))))
          .join(sqb.join('role r').on(Op.eq('trr.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('trr.subject_type', 'registry'))
          .where(Op.in('trr.team', authz.queryTeamsForAccount(currentUser.id)))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('registries-grant')))
          .groupBy('trr.subject');

        const rolesGrantableFromGlobal = sqb
          .select('sr.id id', raw('array_agg(distinct r2.name) roles'))
          .from('active_account_roles__vw arr')
          .join(sqb.join('active_registry__vw sr').on(Op.eq('arr.subject_type', 'global')))
          .join(sqb.join('role r').on(Op.eq('arr.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('arr.account', currentUser.id))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('registries-grant')))
          .groupBy('sr.id');

        const rolesGrantableFromGlobalFromTeam = sqb
          .select('sr.id id', raw('array_agg(distinct r2.name) roles'))
          .from('active_team_roles__vw trr')
          .join(sqb.join('active_registry__vw sr').on(Op.eq('trr.subject_type', 'global')))
          .join(sqb.join('role r').on(Op.eq('trr.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.in('trr.team', authz.queryTeamsForAccount(currentUser.id)))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('registries-grant')))
          .groupBy('sr.id');

        const rolesGrantableBuilder = sqb
          .select(
            raw('COALESCE (s.id, ts.id, g.id, tg.id) id'),
            sqb
              .select(raw('array_agg(distinct role)'))
              .from(
                sqb.select(raw('UNNEST (s.roles || ts.roles|| g.roles || tg.roles) as role')).as('concat') // postgres doesn't have unique for arrays
              ).as('roles')
          )
          // Join the two together with a fullOuterJoin so as to work for having empty from either.
          .from(rolesGrantablePerSubject.as('s'))
          .join(sqb.fullOuterJoin(rolesGrantablePerSubjectFromTeam.as('ts')).on(Op.eq('s.id', raw('ts.id'))))
          .join(sqb.fullOuterJoin(rolesGrantableFromGlobal.as('g')).on(Op.eq('s.id', raw('g.id'))))
          .join(sqb.fullOuterJoin(rolesGrantableFromGlobalFromTeam.as('tg')).on(Op.eq('s.id', raw('tg.id'))));

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

    async function teamRolesForTeams(teamId, currentUser) {
      logger.debug(`Collecting team role information for team ${teamId} as seen by ${currentUser.id}`);
      return db.withTransaction(async connection => {
        const appliedRolesBuilder = authz.queryTeamsWithAppliedRolesForTeamAsSeenBy(teamId, currentUser.id);

        const teamsWithoutRolesBuilder = sqb
          .select('t.id team_id', 't.name team_name')
          .from('active_team__vw t')
          .where(Op.in('t.id', authz.querySubjectIdsWithPermission('team', currentUser.id, 'teams-manage')))
          .where(Op.notIn('t.id', sqb
            .select('team_id')
            .from(appliedRolesBuilder.as('applied'))
          ))
          .orderBy('t.name');

        const rolesGrantablePerSubject = sqb // Grab ids + roles-array of whats grantable per subject
          .select('art.subject id', raw('array_agg(distinct r2.name) roles'))
          .from('active_account_roles__vw art')
          .join(sqb.join('active_team__vw t').on(Op.eq('t.id', raw('art.subject'))))
          .join(sqb.join('role r').on(Op.eq('art.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('art.subject_type', 'team'))
          .where(Op.eq('art.account', currentUser.id))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('teams-manage')))
          .groupBy('art.subject');

        const rolesGrantablePerSubjectFromTeam = sqb // Grab ids + roles-array of whats grantable per subject
          .select('trt.subject id', raw('array_agg(distinct r2.name) roles'))
          .from('active_team_roles__vw trt')
          .join(sqb.join('active_team__vw t').on(Op.eq('t.id', raw('trt.subject'))))
          .join(sqb.join('role r').on(Op.eq('trt.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('trt.subject_type', 'team'))
          .where(Op.in('trt.team', authz.queryTeamsForAccount(currentUser.id)))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('teams-manage')))
          .groupBy('trt.subject');

        const rolesGrantableFromGlobal = sqb
          .select('t.id id', raw('array_agg(distinct r2.name) roles'))
          .from('active_account_roles__vw art')
          .join(sqb.join('active_team__vw t').on(Op.eq('art.subject_type', 'global')))
          .join(sqb.join('role r').on(Op.eq('art.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.eq('art.account', currentUser.id))
          .where(Op.is('art.deleted_on', null))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('teams-manage')))
          .groupBy('t.id');

        const rolesGrantableFromGlobalFromTeam = sqb
          .select('t.id id', raw('array_agg(distinct r2.name) roles'))
          .from('active_team_roles__vw trt')
          .join(sqb.join('active_team__vw t').on(Op.eq('trt.subject_type', 'global')))
          .join(sqb.join('role r').on(Op.eq('trt.role', raw('r.id'))))
          .join(sqb.rightJoin('role r2').on(Op.lte('r2.priority', raw('r.priority'))))
          .where(Op.in('trt.team', authz.queryTeamsForAccount(currentUser.id)))
          .where(Op.is('trt.deleted_on', null))
          .where(Op.in('r.id', authz.queryRoleIdsWithPermission('teams-manage')))
          .groupBy('t.id');

        const rolesGrantableBuilder = sqb
          .select(
            raw('COALESCE (s.id, ts.id, g.id, tg.id) id'),
            sqb
              .select(raw('array_agg(distinct role)'))
              .from(
                sqb.select(raw('UNNEST (s.roles || ts.roles || g.roles || tg.roles) as role')).as('concat') // postgres doesn't have unique for arrays
              ).as('roles')
          )
          // Join the tables together with a fullOuterJoin so as to work for having empty from any.
          .from(rolesGrantablePerSubject.as('s'))
          .join(sqb.fullOuterJoin(rolesGrantablePerSubjectFromTeam.as('ts')).on(Op.eq('s.id', raw('ts.id'))))
          .join(sqb.fullOuterJoin(rolesGrantableFromGlobal.as('g')).on(Op.eq('s.id', raw('g.id'))))
          .join(sqb.fullOuterJoin(rolesGrantableFromGlobalFromTeam.as('tg')).on(Op.eq('s.id', raw('tg.id'))));

        const currentRolesResult = await connection.query(db.serialize(appliedRolesBuilder, {}).sql);
        const teamsWithoutRolesResult = await connection.query(db.serialize(teamsWithoutRolesBuilder, {}).sql);
        const rolesGrantable = await connection.query(db.serialize(rolesGrantableBuilder, {}).sql);

        return {
          currentRoles: currentRolesResult.rows.map(row => ({
            team: new Team({
              id: row.team_id,
              name: row.team_name,
            }),
            roles: row.roles,
          })),
          teamsWithoutRoles: teamsWithoutRolesResult.rows.map(row => (
            new Team({
              id: row.team_id,
              name: row.team_name,
            })
          )),
          rolesGrantable: rolesGrantable.rows,
        };
      });
    }

    async function teamRolesForSystem(teamId, currentUser) {
      logger.debug(`Collecting system role information for team ${teamId} as seen by ${currentUser.id}`);

      return db.withTransaction(async connection => {
        const appliedRolesBuilder = authz.querySystemAppliedRolesForTeam(teamId);
        const rolesGrantableBuilder = authz.queryTeamSystemRolesGrantableAsSeenBy(currentUser.id);
        const globalGrantableBuilder = authz.queryTeamGlobalRolesGrantableAsSeenBy(currentUser.id);

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

    async function _checkCanGrantSystemOnTeam(connection, viewingAccount, role_id) {
      const canGrantBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from(sqb
          .select('id')
            .from(authz.queryTeamSystemRolesGrantableAsSeenBy(viewingAccount.id).as('roles'))
            .where(Op.eq('id', role_id))
            .as('contains')
          );

      const canGrantResult = await connection.query(db.serialize(canGrantBuilder, {}).sql);
      const { answer } = canGrantResult.rows[0];
      return answer;
    }

    async function checkCanGrantSystemOnTeam(roleName, meta) {
      return await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        return _checkCanGrantSystemOnTeam(connection, meta.account, role_id);
      });
    }

    async function _checkCanGrantGlobalOnTeam(connection, viewingAccount, role_id) {
      const canGrantBuilder = sqb
        .select(raw('count(1) > 0 answer'))
        .from(sqb
          .select('id')
            .from(authz.queryTeamGlobalRolesGrantableAsSeenBy(viewingAccount.id).as('roles'))
            .where(Op.eq('id', role_id))
            .as('contains')
          );

      const canGrantResult = await connection.query(db.serialize(canGrantBuilder, {}).sql);
      const { answer } = canGrantResult.rows[0];
      return answer;
    }

    async function checkCanGrantGlobalOnTeam(roleName, meta) {
      return await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        return _checkCanGrantGlobalOnTeam(connection, meta.account, role_id);
      });
    }

    async function grantSystemRoleOnTeam(teamId, roleName, meta) {
      logger.debug(`Granting role: ${roleName} for system to team: ${teamId}`);

      await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        const canGrantAnswer = await _checkCanGrantSystemOnTeam(connection, meta.account, role_id);
        if (!canGrantAnswer) throw new Error(`User ${meta.account.id} cannot grant system role ${roleName}.`);

        const existsBuilder = sqb
          .select(raw('count(1) > 0 answer'))
          .from('active_team_roles__vw tr')
          .where(Op.eq('tr.team', teamId))
          .where(Op.eq('tr.subject_type', 'system'))
          .where(Op.eq('tr.role', role_id));

        const existsResult = await connection.query(db.serialize(existsBuilder, {}).sql);
        const { answer } = existsResult.rows[0];
        if (answer) return;

        const insertBuilder = sqb
          .insert('team_roles', {
            id: uuid(),
            team: teamId,
            role: role_id,
            subject_type: 'system',
            created_by: meta.account.id,
            created_on: meta.date,
          });

        await connection.query(db.serialize(insertBuilder, {}).sql);
        logger.debug(`Granted role: ${roleName} for system to team: ${teamId}`);
      });

      return getTeam(teamId);
    }

    async function revokeSystemRoleFromTeam(teamId, roleName, meta) {
      logger.debug(`Revoking system role: ${roleName} from team: ${teamId}`);
      await db.withTransaction(async connection => {
        const roleIdBuilder = sqb
        .select('r.id role_id')
        .from('role r')
        .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        const canRevokeAnswer = await _checkCanGrantSystemOnTeam(connection, meta.account, role_id);
        if (!canRevokeAnswer) throw new Error(`User ${meta.account.id} cannot revoke system role ${roleName}.`);

        const builder = sqb
          .update('team_roles', {
            deleted_on: meta.date,
            deleted_by: meta.account.id,
          })
          .where(Op.eq('team', teamId))
          .where(Op.in('subject_type', ['global', 'system']))
          .where(Op.eq('role', role_id))
          .where(Op.is('deleted_on', null));

        await connection.query(db.serialize(builder, {}).sql);
      });

      logger.debug(`Revoked system role: ${roleName} from team: ${teamId}`);
    }

    async function grantGlobalRoleOnTeam(teamId, roleName, meta) {
      logger.debug(`Granting role: ${roleName} globally to team: ${teamId}`);
      await db.withTransaction(async connection => {

        const roleIdBuilder = sqb
          .select('r.id role_id')
          .from('role r')
          .where(Op.eq('r.name', roleName));

        const roleIdResult = await connection.query(db.serialize(roleIdBuilder, {}).sql);
        if (!roleIdResult.rowCount) throw new Error(`Role name ${roleName} does not exist.`);
        const { role_id } = roleIdResult.rows[0];

        const canGrantAnswer = await _checkCanGrantGlobalOnTeam(connection, meta.account, role_id);
        if (!canGrantAnswer) throw new Error(`User ${meta.account.id} cannot grant global role ${roleName}.`);

        const hasSystemRoleBuilder = sqb
          .select(raw('count(1) > 0 answer'))
          .from('active_team_roles__vw tr')
          .where(Op.eq('tr.team', teamId))
          .where(Op.eq('tr.subject_type', 'system'))
          .where(Op.eq('tr.role', role_id));

          const systemRoleExistsResult = await connection.query(db.serialize(hasSystemRoleBuilder, {}).sql);
          const { answer: systemAnswer } = systemRoleExistsResult.rows[0];
          if (!systemAnswer) throw new Error(`Cannot grant global role ${roleName} to ${teamId} without having granted it for system.`);

        const existsBuilder = sqb
          .select(raw('count(1) > 0 answer'))
          .from('active_team_roles__vw tr')
          .where(Op.eq('tr.team', teamId))
          .where(Op.eq('tr.subject_type', 'global'))
          .where(Op.eq('tr.role', role_id));

        const existsResult = await connection.query(db.serialize(existsBuilder, {}).sql);
        const { answer } = existsResult.rows[0];
        if (answer) return;

        const insertBuilder = sqb
          .insert('team_roles', {
            id: uuid(),
            team: teamId,
            role: role_id,
            subject_type: 'global',
            created_by: meta.account.id,
            created_on: meta.date,
          });

        await connection.query(db.serialize(insertBuilder, {}).sql);
        logger.debug(`Granted role: ${roleName} globally to team: ${teamId}`);
      });

      return getTeam(teamId);
    }

    async function grantRoleOnRegistryOnTeam(teamId, roleName, registryId, meta) {
      logger.debug(`Granting role: ${roleName} on registry: ${registryId} to team: ${teamId}`);
      await db.withTransaction(async connection => {

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
          .from('active_team_roles__vw tr')
          .where(Op.eq('tr.team', teamId))
          .where(Op.eq('tr.subject_type', 'registry'))
          .where(Op.eq('tr.subject', registryId))
          .where(Op.eq('tr.role', role_id));

        const existsResult = await connection.query(db.serialize(existsBuilder, {}).sql);
        const { answer } = existsResult.rows[0];
        if (answer) return;

        const insertBuilder = sqb
          .insert('team_roles', {
            id: uuid(),
            account: teamId,
            role: role_id,
            subject: registryId,
            subject_type: 'registry',
            created_by: meta.account.id,
            created_on: meta.date,
          });

        await connection.query(db.serialize(insertBuilder, {}).sql);

        logger.debug(`Granted role: ${roleName} on registry: ${registryId} to team: ${teamId}`);
      });

      return getTeam(teamId);
    }

    async function revokeRoleOnRegistryFromTeam(teamId, roleName, registryId, meta) {
      logger.debug(`Revoking role: ${roleName} on registry: ${registryId} to team: ${teamId}`);

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
        .update('team_roles', {
          deleted_on: meta.date,
          deleted_by: meta.account.id,
        })
        .where(Op.eq('team', teamId))
        .where(Op.eq('subject_type', 'registry'))
        .where(Op.eq('subject', registryId))
        .where(Op.eq('role', role_id))
        .where(Op.is('deleted_on', null));

        await connection.query(db.serialize(builder, {}).sql);
      });

      logger.debug(`Revoked role: ${roleName} on registry: ${registryId} from team: ${teamId}`);

      return getTeam(teamId);
    }

    async function grantRoleOnNamespaceOnTeam(teamId, roleName, namespaceId, meta) {
      logger.debug(`Granting role: ${roleName} on namespace: ${namespaceId} to team: ${teamId}`);
      await db.withTransaction(async connection => {

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
          .from('active_team_roles__vw tr')
          .where(Op.eq('tr.team', teamId))
          .where(Op.eq('tr.subject_type', 'namespace'))
          .where(Op.eq('tr.subject', namespaceId))
          .where(Op.eq('tr.role', role_id));

        const existsResult = await connection.query(db.serialize(existsBuilder, {}).sql);
        const { answer } = existsResult.rows[0];
        if (answer) return;

        const insertBuilder = sqb
          .insert('team_roles', {
            id: uuid(),
            team: teamId,
            role: role_id,
            subject: namespaceId,
            subject_type: 'namespace',
            created_by: meta.account.id,
            created_on: meta.date,
          });

        await connection.query(db.serialize(insertBuilder, {}).sql);

        logger.debug(`Granted role: ${roleName} on namespace: ${namespaceId} to team: ${teamId}`);
      });

      return getTeam(teamId);
    }

    async function revokeRoleOnNamespaceFromTeam(teamId, roleName, namespaceId, meta) {
      logger.debug(`Revoking role: ${roleName} on namespace: ${namespaceId} to team: ${teamId}`);

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
        .update('team_roles', {
          deleted_on: meta.date,
          deleted_by: meta.account.id,
        })
        .where(Op.eq('team', teamId))
        .where(Op.eq('subject_type', 'namespace'))
        .where(Op.eq('subject', namespaceId))
        .where(Op.eq('role', role_id))
        .where(Op.is('deleted_on', null));

        await connection.query(db.serialize(builder, {}).sql);
      });

      logger.debug(`Revoked role: ${roleName} on namespace: ${namespaceId} from team: ${teamId}`);

      return getTeam(teamId);
    }

    function toTeam(row, attributes = [], services = []) {
      return new Team({
        id: row.id,
        name: row.name,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
        attributes: attributes.reduce((attrs, row) => {
          return { ...attrs, [row.name]: row.value };
        }, {}),
        services: services.map(row => (new Service({
          id: row.service_id,
          name: row.service_name,
          registry: new Registry({
            id: row.registry_id,
            name: row.registry_name,
          })
        }))),
      });
    }

    return cb(null, {
      getTeam,
      deleteTeam,
      findTeams,
      findTeam,
      saveTeam,
      associateServiceWithTeam,
      disassociateService,
      getTeamForService,
      membershipToTeams,
      associateAccountWithTeam,
      disassociateAccount,
      teamRolesForNamespaces,
      teamRolesForRegistries,
      teamRolesForSystem,
      teamRolesForTeams,
      checkCanGrantSystemOnTeam,
      checkCanGrantGlobalOnTeam,
      grantSystemRoleOnTeam,
      revokeSystemRoleFromTeam,
      grantGlobalRoleOnTeam,
      grantRoleOnRegistryOnTeam,
      revokeRoleOnRegistryFromTeam,
      grantRoleOnNamespaceOnTeam,
      revokeRoleOnNamespaceFromTeam,
    });
  }

  return {
    start,
  };
}
