import SQL from './sql';

export default function(options) {

  function start({ config, logger, postgres: db, }, cb) {

    async function saveDeployment(release, {context,}, meta) {
      logger.debug(`Saving deployment - service: ${release.service.name}, release: ${release.version}, context: ${context}`);

      const result = await db.query(SQL.SAVE_DEPLOYMENT, [
        release.id, context, meta.date, meta.user,
      ]);

      const deployment = {
        id: result.rows[0].id, release: release.id, context, createdOn: meta.date, createdBy: meta.user,
      };

      logger.debug(`Saved deployment - service: ${release.service.name}, release: ${release.version}, context: ${context} with id: ${deployment.id}`);

      return deployment;
    }

    async function getDeployment(id) {
      logger.debug(`Getting deployment by id: ${id}`);

      const deploymentResult = await db.query(SQL.SELECT_DEPLOYMENT_BY_ID, [id,]);

      logger.debug(`Found ${deploymentResult.rowCount} releases with id: ${id}`);
      return deploymentResult.rowCount ? toDeployment(deploymentResult.rows[0]) : undefined;
    }

    function toDeployment(row) {
      return {
        id: row.id,
        release: row.release,
        context: row.context,
        createdOn: row.created_on,
        createdBy: row.created_by,
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
