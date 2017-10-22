import SQL from './sql';

export default function(options) {

  function start({ config, logger, postgres: db, }, cb) {

    async function saveProfile(data, meta) {

      logger.debug(`Saving profile: ${data.name}, version: ${data.version}`);

      return await withTransaction(async connection => {
        const result = await db.query(SQL.SAVE_PROFILE, [
          data.name, data.version, meta.date, meta.user,
        ]);

        const profile = {
          ...data, id: result.rows[0].id,
        };

        logger.debug(`Saved profile: ${data.name}, version: ${profile.version} with id: ${profile.id}`);

        return profile;
      });
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

    return cb(null, {
      saveProfile,
    });
  }

  return {
    start,
  };
}
