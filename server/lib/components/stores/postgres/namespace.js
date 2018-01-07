import SQL from './sql';
import Namespace from '../../../domain/Namespace';

export default function(options) {

  function start({ config, logger, db, }, cb) {

    async function getNamespace(id) {
      logger.debug(`Getting namespace by id: ${id}`);
      const result = await db.query(SQL.SELECT_NAMESPACE_BY_ID, [id,]);
      logger.debug(`Found ${result.rowCount} namespaces with id: ${id}`);
      return result.rowCount ? toNamespace(result.rows[0]) : undefined;
    }

    async function findNamespace({ name, }) {
      logger.debug(`Finding namespace by name: ${name}`);

      const namespace = await db.query(SQL.SELECT_NAMESPACE_BY_NAME, [
        name,
      ]);

      logger.debug(`Found ${namespace.rowCount} namespaces with name: ${name}`);

      if (namespace.rowCount === 0) return;

      return toNamespace(namespace.rows[0]);
    }

    async function saveNamespace(data, meta) {
      logger.debug(`Saving namespace: ${data.name}`);

      const result = await db.query(SQL.SAVE_NAMESPACE, [
        data.name, meta.date, meta.account,
      ]);

      await db.query(SQL.REFRESH_ENTITY_COUNT);

      const namespace = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account,
      };

      logger.debug(`Saved namespace: ${namespace.name}/${namespace.id}`);

      return namespace;
    }

    async function listNamespaces(limit = 50, offset = 0) {

      logger.debug(`Listing up to ${limit} namespaces starting from offset: ${offset}`);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.LIST_NAMESPACES, [ limit, offset, ]),
          connection.query(SQL.COUNT_ACTIVE_ENTITIES, [ 'namespace', ]),
        ]).then(([namespaceResult, countResult,]) => {
          const items = namespaceResult.rows.map(row => toNamespace(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} namespaces`);
          return { limit, offset, count, items, };
        });
      });
    }

    async function deleteNamespace(id, meta) {
      logger.debug(`Deleting namespace id: ${id}`);
      await db.query(SQL.DELETE_NAMESPACE, [
        id,
        meta.date,
        meta.account,
      ]);
      await db.query(SQL.REFRESH_ENTITY_COUNT);
      logger.debug(`Deleted namespace id: ${id}`);
    }

    function toNamespace(row) {
      return new Namespace({
        id: row.id,
        name: row.name,
        createdOn: row.created_on,
        createdBy: row.created_by,
      });
    }

    return cb(null, {
      getNamespace,
      findNamespace,
      listNamespaces,
      saveNamespace,
      deleteNamespace,
    });
  }

  return {
    start,
  };
}
