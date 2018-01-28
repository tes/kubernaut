import SQL from './sql';
import Registry from '../../../domain/Registry';
import Account from '../../../domain/Account';
import sqb from 'sqb';

export default function(options) {

  const { Op, raw, } = sqb;

  function start({ config, logger, db, }, cb) {

    async function saveRegistry(data, meta) {
      logger.debug(`Saving registry: ${data.name}`);

      const result = await db.query(SQL.SAVE_REGISTRY, [
        data.name, meta.date, meta.account.id,
      ]);

      const registry = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Saved registry: ${registry.name}/${registry.id}`);

      return registry;
    }

    async function getRegistry(id) {
      logger.debug(`Getting registry by id: ${id}`);
      const result = await db.query(SQL.SELECT_REGISTRY_BY_ID, [id,]);
      logger.debug(`Found ${result.rowCount} registries with id: ${id}`);
      return result.rowCount ? toRegistry(result.rows[0]) : undefined;
    }

    async function findRegistry(criteria) {
      const list = await findRegistries(criteria, 2, 0);
      if (list.count > 1) throw new Error(`Expected 0 or 1 registries but found ${list.count}}`);
      return list.count === 1 ? list.items[0] : undefined;
    }

    async function findRegistries(criteria = {}, limit = 50, offset = 0) {

      logger.debug(`Finding up to ${limit} registries matching criteria: ${criteria} starting from offset: ${offset}`);

      const bindVariables = {};

      const findRegistriesBuilder = sqb
        .select('r.id', 'r.name', 'r.created_on', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_registry__vw r', 'account cb')
        .where(Op.eq('r.created_by', raw('cb.id')))
        .orderBy('r.name asc')
        .limit(limit)
        .offset(offset);

      const countRegistriesBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_registry__vw r');

      if (criteria.hasOwnProperty('ids')) {
        db.buildWhereClause('r.id', criteria.ids, bindVariables, findRegistriesBuilder, countRegistriesBuilder);
      }

      if (criteria.hasOwnProperty('name')) {
        db.buildWhereClause('r.name', criteria.name, bindVariables, findRegistriesBuilder, countRegistriesBuilder);
      }

      const findRegistriesStatement = db.serialize(findRegistriesBuilder, bindVariables);
      const countRegistriesStatement = db.serialize(countRegistriesBuilder, bindVariables);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(findRegistriesStatement.sql, findRegistriesStatement.values),
          connection.query(countRegistriesStatement.sql, countRegistriesStatement.values),
        ]).then(([registryResult, countResult,]) => {
          const items = registryResult.rows.map(row => toRegistry(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} registries`);
          return { limit, offset, count, items, };
        });
      });
    }

    async function deleteRegistry(id, meta) {
      logger.debug(`Deleting registry id: ${id}`);
      await db.query(SQL.DELETE_REGISTRY, [
        id, meta.date, meta.account.id,
      ]);
      logger.debug(`Deleted registry id: ${id}`);
    }

    function toRegistry(row) {
      return new Registry({
        id: row.id,
        name: row.name,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
      });
    }

    return cb(null, {
      saveRegistry,
      getRegistry,
      findRegistry,
      findRegistries,
      deleteRegistry,
    });
  }

  return {
    start,
  };
}
