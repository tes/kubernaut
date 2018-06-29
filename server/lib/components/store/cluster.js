import SQL from './sql';
import Cluster from '../../domain/Cluster';
import Account from '../../domain/Account';
import sqb from 'sqb';

export default function(options) {

  const { Op, raw } = sqb;

  function start({ config, logger, db }, cb) {

    async function saveCluster(data, meta) {
      logger.debug(`Saving cluster: ${data.name}`);

      const result = await db.query(SQL.SAVE_CLUSTER, [
        data.name, data.config, data.color, meta.date, meta.account.id,
      ]);

      const cluster = new Cluster({
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      });

      logger.debug(`Saved cluster: ${cluster.name}/${cluster.id}`);

      return cluster;
    }

    async function getCluster(id) {
      logger.debug(`Getting cluster by id: ${id}`);
      const result = await db.query(SQL.SELECT_CLUSTER_BY_ID, [id]);
      logger.debug(`Found ${result.rowCount} clusters with id: ${id}`);
      return result.rowCount ? toCluster(result.rows[0]) : undefined;
    }

    async function findCluster(criteria) {
      const list = await findClusters(criteria, 1, 0);
      if (list.count > 1) throw new Error(`Expected 0 or 1 clusters but found ${list.count}}`);
      return list.count === 1 ? list.items[0] : undefined;
    }

    async function findClusters(criteria = {}, limit = 50, offset = 0) {

      logger.debug(`Finding up to ${limit} clusters matching criteria: ${criteria} starting from offset: ${offset}`);

      const bindVariables = {};

      const findClustersBuilder = sqb
        .select('c.id', 'c.name', 'c.config', 'c.created_on', 'c.color', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_cluster__vw c', 'account cb')
        .where(Op.eq('c.created_by', raw('cb.id')))
        .orderBy('c.name asc')
        .limit(limit)
        .offset(offset);

      const countClustersBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_cluster__vw c');

      if (criteria.hasOwnProperty('name')) {
        db.buildWhereClause('c.name', criteria.name, bindVariables, findClustersBuilder, countClustersBuilder);
      }

      const findClustersStatement = db.serialize(findClustersBuilder, bindVariables);
      const countClustersStatement = db.serialize(countClustersBuilder, bindVariables);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(findClustersStatement.sql, findClustersStatement.values),
          connection.query(countClustersStatement.sql, countClustersStatement.values),
        ]).then(([clusterResult, countResult]) => {
          const items = clusterResult.rows.map(row => toCluster(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} clusters`);
          return { limit, offset, count, items };
        });
      });
    }

    async function deleteCluster(id, meta) {
      logger.debug(`Deleting cluster id: ${id}`);
      await db.query(SQL.DELETE_CLUSTER, [
        id, meta.date, meta.account.id,
      ]);
      logger.debug(`Deleted cluster id: ${id}`);
    }

    function toCluster(row) {
      return new Cluster({
        id: row.id,
        name: row.name,
        config: row.config,
        createdOn: row.created_on,
        color: row.color,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
      });
    }

    return cb(null, {
      getCluster,
      findCluster,
      findClusters,
      saveCluster,
      deleteCluster,
    });
  }

  return {
    start,
  };
}
