import sqb from 'sqb';
import { v4 as uuid } from 'uuid';
import Promise from 'bluebird';
import Team from '../../domain/Team';
import Account from '../../domain/Account';


const { Op, raw, innerJoin } = sqb;

export default function(options) {
  function start({ config, logger, db, authz }, cb) {

    async function getTeam(id) {
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


      return db.withTransaction(async connection => {
        const [teamResult, attrsResult] = await Promise.all([
          connection.query(db.serialize(teamBuilder, {}).sql),
          connection.query(db.serialize(attributeBuilder, {}).sql),
        ]);

        logger.debug(`Found ${teamResult.rowCount} teams with id: ${id}`);
        return teamResult.rowCount ? toTeam(teamResult.rows[0], attrsResult.rows) : undefined;
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
        .from('active_team__vw s')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('s.created_by', raw('a.id')))
        );

      if (criteria.filters) {
        if (criteria.filters.name) {
          db.applyFilter(criteria.filters.name, 't.name', findTeamsBuilder, countTeamsBuilder);
        }

        if (criteria.filters.createdBy) {
          db.applyFilter(criteria.filters.createdBy, 'a.display_name', findTeamsBuilder, countTeamsBuilder);
        }
      }

      // if (criteria.user) {
      //   const idsQuery = authz.querySubjectIdsWithPermission('registry', criteria.user.id, criteria.user.permission);
      //   [findTeamsBuilder, countTeamsBuilder].forEach(builder => builder.where(Op.in('sr.id', idsQuery)));
      // }

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

    function toTeam(row, attributes = []) {
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
      });
    }

    return cb(null, {
      getTeam,
      deleteTeam,
      findTeams,
      findTeam,
      saveTeam,
    });
  }

  return {
    start,
  };
}
