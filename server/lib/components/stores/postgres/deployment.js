import SQL from './sql';
import Namespace from '../../../domain/Namespace';

export default function(options) {

  function start({ config, logger, postgres: db, }, cb) {

    async function getDeployment(id) {
      logger.debug(`Getting deployment by id: ${id}`);

      const deploymentResult = await db.query(SQL.SELECT_DEPLOYMENT_BY_ID, [id,]);

      logger.debug(`Found ${deploymentResult.rowCount} deployments with id: ${id}`);

      return deploymentResult.rowCount ? toDeployment(deploymentResult.rows[0]) : undefined;
    }

    async function saveDeployment(data, meta) {
      logger.debug(`Saving deployment: ${data.release.service.name}/${data.release.version}/${data.context}`);

      const result = await db.query(SQL.SAVE_DEPLOYMENT, [
        data.release.id, data.context, data.manifest.yaml, JSON.stringify(data.manifest.json), meta.date, meta.account,
      ]);

      const deployment = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account,
      };

      await db.query(SQL.REFRESH_ENTITY_COUNT);

      logger.debug(`Saved deployment: ${deployment.release.service.name}/${deployment.release.version}/${deployment.context}/${deployment.id}`);

      return deployment;
    }

    async function listDeployments(limit = 50, offset = 0) {

      logger.debug(`Listing up to ${limit} deployments starting from offset: ${offset}`);

      return withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.LIST_DEPLOYMENTS, [ limit, offset, ]),
          connection.query(SQL.COUNT_ACTIVE_ENTITIES, [ 'deployment', ]),
        ]).then(([deploymentResult, countResult,]) => {
          const items = deploymentResult.rows.map(row => toDeployment(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} deployments`);
          return { limit, offset, count, items, };
        });
      });
    }

    async function deleteDeployment(id, meta) {
      logger.debug(`Deleting deployment id: ${id}`);
      await db.query(SQL.DELETE_DEPLOYMENT, [
        id, meta.date, meta.account,
      ]);
      await db.query(SQL.REFRESH_ENTITY_COUNT);
    }

    async function withTransaction(operations) {
      logger.debug(`Retrieving db client from the pool`);

      const connection = await db.connect();
      try {
        await connection.query('BEGIN');
        const result = await operations(connection);
        await connection.query('COMMIT');
        return result;
      } catch (err) {
        await connection.query('ROLLBACK');
        throw err;
      } finally {
        logger.debug(`Returning db client to the pool`);
        connection.release();
      }
    }

    function toDeployment(row) {
      return {
        id: row.id,
        context: row.context,
        manifest: {
          yaml: row.manifest_yaml,
          json: row.manifest_json,
        },
        release: {
          id: row.release_id,
          service: {
            id: row.service_id,
            name: row.service_name,
            namespace: new Namespace({
              id: row.namespace_id,
              name: row.namespace_name,
            }),
          },
          version: row.release_version,
        },
        createdOn: row.created_on,
        createdBy: row.created_by,
        deletedOn: row.deleted_on,
        deletedBy: row.deleted_by,
      };
    }

    return cb(null, {
      saveDeployment,
      getDeployment,
      deleteDeployment,
      listDeployments,
    });
  }

  return {
    start,
  };
}
