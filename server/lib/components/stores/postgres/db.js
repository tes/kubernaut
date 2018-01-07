export default function(options = {}) {

  function start({ config, logger, postgres, }, cb) {

    postgres.on('error', err => {
      logger.warn(err, 'Database client errored and was evicted from the pool');
    });

    async function query(...args) {
      return postgres.query.apply(postgres, args);
    }

    async function withTransaction(operations) {
      const connection = await postgres.connect();
      try {
        await connection.query('BEGIN');
        const result = await operations(connection);
        await connection.query('COMMIT');
        return result;
      } catch (err) {
        await connection.query('ROLLBACK');
        throw err;
      } finally {
        connection.release();
      }
    }

    cb(null, {
      query,
      withTransaction,
    });
  }

  return {
    start,
  };
}
