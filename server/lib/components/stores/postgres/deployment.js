import SQL from './sql';

export default function(options) {
  function start({ config, logger, postgres: db, }, cb) {
    async function saveDeployment(release, {context,}, meta) {
      logger.debug(`Retrieving db client from the pool`);
      const connection = await db.connect();
      try {
        logger.debug(`Saving deployment - service: ${release.service.name}, release: ${release.version}, context: ${context}`);

        const result = await connection.query(SQL.SAVE_DEPLOYMENT, [
          release.id, context, meta.date, meta.user,
        ]);

        const deployment = {
          id: result.rows[0].id, release: release.id, context, createdOn: meta.date, createdBy: meta.user,
        };

        logger.debug(`Saved deployment - service: ${release.service.name}, release: ${release.version}, context: ${context} with id: ${deployment.id}`);

        return deployment;
      } finally {
        logger.debug(`Returning db client to the pool`);
        connection.release();
      }
    }

    return cb(null, {
      saveDeployment,
    });
  }

  return {
    start,
  };
}
