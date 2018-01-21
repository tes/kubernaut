import SQL from './sql';
import Registry from '../../../domain/Registry';
import Account from '../../../domain/Account';

export default function(options) {

  function start({ config, logger, db, }, cb) {

    async function getRegistry(id) {
      logger.debug(`Getting registry by id: ${id}`);
      const result = await db.query(SQL.SELECT_REGISTRY_BY_ID, [id,]);
      logger.debug(`Found ${result.rowCount} registries with id: ${id}`);
      return result.rowCount ? toRegistry(result.rows[0]) : undefined;
    }

    async function findRegistry({ name, }) {
      logger.debug(`Finding registry by name: ${name}`);

      const registry = await db.query(SQL.SELECT_REGISTRY_BY_NAME, [
        name,
      ]);

      logger.debug(`Found ${registry.rowCount} registries with name: ${name}`);

      if (registry.rowCount === 0) return;

      return toRegistry(registry.rows[0]);
    }

    async function saveRegistry(data, meta) {
      logger.debug(`Saving registry: ${data.name}`);

      const result = await db.query(SQL.SAVE_REGISTRY, [
        data.name, meta.date, meta.account.id,
      ]);

      await db.refreshEntityCount();

      const registry = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Saved registry: ${registry.name}/${registry.id}`);

      return registry;
    }

    async function listRegistries(limit = 50, offset = 0) {

      logger.debug(`Listing up to ${limit} registries starting from offset: ${offset}`);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.LIST_REGISTRIES, [ limit, offset, ]),
          connection.query(SQL.COUNT_ACTIVE_ENTITIES, [ 'registry', ]),
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
      await db.query(SQL.REFRESH_ENTITY_COUNT);
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
      getRegistry,
      findRegistry,
      listRegistries,
      saveRegistry,
      deleteRegistry,
    });
  }

  return {
    start,
  };
}
