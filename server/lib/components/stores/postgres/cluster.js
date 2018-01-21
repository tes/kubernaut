import SQL from './sql';
import Cluster from '../../../domain/Cluster';
import Account from '../../../domain/Account';

export default function(options) {

  function start({ config, logger, db, }, cb) {

    async function getCluster(id) {
      logger.debug(`Getting cluster by id: ${id}`);
      const result = await db.query(SQL.SELECT_CLUSTER_BY_ID, [id,]);
      logger.debug(`Found ${result.rowCount} clusters with id: ${id}`);
      return result.rowCount ? toCluster(result.rows[0]) : undefined;
    }

    async function findCluster({ name, }) {
      logger.debug(`Finding cluster by name: ${name}`);

      const cluster = await db.query(SQL.SELECT_CLUSTER_BY_NAME, [
        name,
      ]);

      logger.debug(`Found ${cluster.rowCount} clusters with name: ${name}`);

      if (cluster.rowCount === 0) return;

      return toCluster(cluster.rows[0]);
    }

    async function saveCluster(data, meta) {
      logger.debug(`Saving cluster: ${data.name}`);

      const result = await db.query(SQL.SAVE_CLUSTER, [
        data.name, data.context, meta.date, meta.account.id,
      ]);

      await db.refreshEntityCount();

      const cluster = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Saved cluster: ${cluster.name}/${cluster.id}`);

      return cluster;
    }

    async function listClusters(limit = 50, offset = 0) {

      logger.debug(`Listing up to ${limit} clusters starting from offset: ${offset}`);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.LIST_CLUSTERS, [ limit, offset, ]),
          connection.query(SQL.COUNT_ACTIVE_ENTITIES, [ 'cluster', ]),
        ]).then(([clusterResult, countResult,]) => {
          const items = clusterResult.rows.map(row => toCluster(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} clusters`);
          return { limit, offset, count, items, };
        });
      });
    }

    async function deleteCluster(id, meta) {
      logger.debug(`Deleting cluster id: ${id}`);
      await db.query(SQL.DELETE_CLUSTER, [
        id, meta.date, meta.account.id,
      ]);
      await db.query(SQL.REFRESH_ENTITY_COUNT);
      logger.debug(`Deleted cluster id: ${id}`);
    }

    function toCluster(row) {
      return new Cluster({
        id: row.id,
        name: row.name,
        context: row.context,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
      });
    }

    return cb(null, {
      getCluster,
      findCluster,
      listClusters,
      saveCluster,
      deleteCluster,
    });
  }

  return {
    start,
  };
}
