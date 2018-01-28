import SQL from './sql';
import Namespace from '../../../domain/Namespace';
import Account from '../../../domain/Account';
import sqb from 'sqb';

export default function(options) {

  const { Op, raw, } = sqb;

  function start({ config, logger, db, }, cb) {

    async function getNamespace(id) {
      logger.debug(`Getting namespace by id: ${id}`);
      const result = await db.query(SQL.SELECT_NAMESPACE_BY_ID, [id,]);
      logger.debug(`Found ${result.rowCount} namespaces with id: ${id}`);
      return result.rowCount ? toNamespace(result.rows[0]) : undefined;
    }

    async function findNamespace({ name, cluster, }) {
      logger.debug(`Finding namespace by name: ${name} and cluster: ${cluster}`);

      const namespace = await db.query(SQL.SELECT_NAMESPACE_BY_NAME_AND_CLUSTER, [
        name, cluster,
      ]);

      logger.debug(`Found ${namespace.rowCount} namespaces with name: ${name} and cluster: ${cluster}`);

      if (namespace.rowCount === 0) return;

      return toNamespace(namespace.rows[0]);
    }

    async function saveNamespace(data, meta) {
      logger.debug(`Saving namespace: ${data.cluster.id}/${data.name}`);

      const result = await db.query(SQL.SAVE_NAMESPACE, [
        data.name, data.cluster.id, meta.date, meta.account.id,
      ]);

      await db.refreshEntityCount();

      const namespace = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Saved namespace:${data.cluster.id}/${namespace.name}/${namespace.id}`);

      return namespace;
    }

    async function findNamespaces(criteria = {}, limit = 50, offset = 0) {

      logger.debug(`Finding up to ${limit} namespaces matching criteria: ${criteria} starting from offset: ${offset}`);

      const bindVariables = {};

      const findNamespacesBuilder = sqb
        .select('n.id', 'n.name', 'n.created_on', 'c.id cluster_id', 'c.name cluster_name', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_namespace__vw n', 'cluster c', 'account cb')
        .where(Op.eq('n.cluster', raw('c.id')))
        .where(Op.eq('n.created_by', raw('cb.id')))
        .orderBy('n.name asc')
        .limit(limit)
        .offset(offset);

      const countNamespacesBuilder = sqb
        .select(raw('count(*)'))
        .from('active_namespace__vw n', 'cluster c')
        .where(Op.eq('n.cluster', raw('c.id')));

      if (criteria.hasOwnProperty('ids')) {
        db.buildWhereClause('n.id', criteria.ids, bindVariables, findNamespacesBuilder, countNamespacesBuilder);
      }

      if (criteria.hasOwnProperty('name')) {
        db.buildWhereClause('n.name', criteria.name, bindVariables, findNamespacesBuilder, countNamespacesBuilder);
      }

      if (criteria.hasOwnProperty('cluster')) {
        db.buildWhereClause('c.name', criteria.cluster, bindVariables, findNamespacesBuilder, countNamespacesBuilder);
      }

      const findNamespacesStatement = db.serialize(findNamespacesBuilder, bindVariables);
      const countNamespacesStatement = db.serialize(countNamespacesBuilder, bindVariables);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(findNamespacesStatement.sql, findNamespacesStatement.values),
          connection.query(countNamespacesStatement.sql, countNamespacesStatement.values),
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
        id, meta.date, meta.account.id,
      ]);
      await db.query(SQL.REFRESH_ENTITY_COUNT);
      logger.debug(`Deleted namespace id: ${id}`);
    }

    function toNamespace(row) {
      return new Namespace({
        id: row.id,
        name: row.name,
        cluster: {
          id: row.cluster_id,
          name: row.cluster_name,
          context: row.cluster_context,
        },
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
      });
    }

    return cb(null, {
      getNamespace,
      findNamespace,
      findNamespaces,
      saveNamespace,
      deleteNamespace,
    });
  }

  return {
    start,
  };
}
