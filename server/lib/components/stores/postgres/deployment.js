import SQL from './sql';

export default function(options) {

  function start({ config, logger, postgres: db, }, cb) {

    async function getDeployment(id) {
      logger.debug(`Getting deployment by id: ${id}`);

      const deploymentResult = await db.query(SQL.SELECT_DEPLOYMENT_BY_ID, [id,]);

      logger.debug(`Found ${deploymentResult.rowCount} releases with id: ${id}`);

      return deploymentResult.rowCount ? toDeployment(deploymentResult.rows[0]) : undefined;
    }

    async function saveDeployment(data, meta) {
      logger.debug(`Saving deployment: ${data.release.service.name}/${data.release.version}/${data.context}`);

      const result = await db.query(SQL.SAVE_DEPLOYMENT, [
        data.release.id, data.context, meta.date, meta.user,
      ]);

      const deployment = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.user,
      };

      logger.debug(`Saved deployment: ${deployment.release.service.name}/${deployment.release.version}/${deployment.context}/${deployment.id}`);

      return deployment;
    }

    function toDeployment(row) {
      return {
        id: row.id,
        release: {
          id: row.release_id,
          service: {
            id: row.service_id,
            name: row.service_name,
            createdOn: row.service_created_on,
            createdBy: row.service_created_by,
            deletedOn: row.service_deleted_on,
            deletedBy: row.service_deleted_by,
          },
          version: row.release_version,
          template: row.release_template_id ? {
            id: row.release_template_id,
            source: row.release_template_source,
            checksum: row.release_template_checksum,
          } : undefined,
          createdOn: row.release_created_on,
          createdBy: row.release_created_by,
          deletedOn: row.release_deleted_on,
          deletedBy: row.release_deleted_by,
        },
        context: row.context,
        createdOn: row.created_on,
        createdBy: row.created_by,
        deletedOn: row.deleted_on,
        deletedBy: row.deleted_by,
      };
    }

    return cb(null, {
      saveDeployment,
      getDeployment,
    });
  }

  return {
    start,
  };
}
