import SQL from './sql';
import Namespace from '../../../domain/Namespace';
import Service from '../../../domain/Service';
import Release from '../../../domain/Release';
import Manifest from '../../../domain/Manifest';
import Deployment from '../../../domain/Deployment';
import DeploymentLogEntry from '../../../domain/DeploymentLogEntry';
import Account from '../../../domain/Account';

export default function(options) {

  function start({ config, logger, db, }, cb) {

    async function getDeployment(id) {
      logger.debug(`Getting deployment by id: ${id}`);

      return await db.withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.SELECT_DEPLOYMENT_BY_ID, [id,]),
          connection.query(SQL.LIST_DEPLOYMENT_LOG_ENTRIES_BY_DEPLOYMENT, [id,]),
        ]).then(([deploymentResult, logEntryResult,]) => {
          logger.debug(`Found ${deploymentResult.rowCount} deployments with id: ${id}`);
          return deploymentResult.rowCount ? toDeployment(deploymentResult.rows[0], logEntryResult.rows) : undefined;
        });
      });
    }

    async function saveDeployment(data, meta) {
      logger.debug(`Saving deployment: ${data.release.service.name}/${data.release.version}/${data.namespace.name}/${data.context}`);

      const result = await db.query(SQL.SAVE_DEPLOYMENT, [
        data.release.id, data.namespace.id, data.context, data.manifest.yaml, JSON.stringify(data.manifest.json), meta.date, meta.account.id,
      ]);

      const deployment = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

      await db.refreshEntityCount();

      logger.debug(`Saved deployment: ${deployment.release.service.name}/${deployment.release.version}/${deployment.context.name}/${deployment.id}`);

      return deployment;
    }

    async function saveDeploymentLogEntry(data) {
      logger.debug(`Saving deployment log entry: ${data.deployment.id}`);

      const result = await db.query(SQL.SAVE_DEPLOYMENT_LOG_ENTRY, [
        data.deployment.id, data.writtenOn, data.writtenTo, data.content,
      ]);

      const deploymentLogEntry = {
        ...data, id: result.rows[0].id,
      };

      logger.debug(`Saved deployment log entry: ${data.deployment.id}/${deploymentLogEntry.id}`);

      return deploymentLogEntry;
    }

    async function listDeployments(limit = 50, offset = 0) {

      logger.debug(`Listing up to ${limit} deployments starting from offset: ${offset}`);

      return db.withTransaction(async connection => {
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
        id, meta.date, meta.account.id,
      ]);
      await db.refreshEntityCount();
    }

    function toDeployment(row, logRows = []) {
      return new Deployment({
        id: row.id,
        namespace: new Namespace({
          id: row.namespace_id,
          name: row.namespace_name,
        }),
        context: row.context,
        manifest: new Manifest({
          yaml: row.manifest_yaml,
          json: row.manifest_json,
        }),
        log: logRows.map(row => {
          return new DeploymentLogEntry({
            id: row.id,            sequence: row.sequence,
            writtenOn: row.written_on,
            writtenTo: row.written_to,
            content: row.content,
          });
        }),
        release: new Release({
          id: row.release_id,
          service: new Service({
            id: row.service_id,
            name: row.service_name,
          }),
          version: row.release_version,
        }),
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
      });
    }

    return cb(null, {
      saveDeployment,
      saveDeploymentLogEntry,
      getDeployment,
      deleteDeployment,
      listDeployments,
    });
  }

  return {
    start,
  };
}
