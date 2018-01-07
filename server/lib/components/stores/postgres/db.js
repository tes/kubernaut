import SQL from './sql';

export default function(options = {}) {

  function start({ config = {}, logger, postgres, }, cb) {

    let _refreshEntityCountDisabled = false;

    postgres.on('error', err => {
      logger.warn(err, 'Database client errored and was evicted from the pool');
    });

    async function query(...args) {
      return postgres.query.apply(postgres, args);
    }

    async function refreshEntityCount() {
      if (_refreshEntityCountDisabled) return;
      return postgres.query(SQL.REFRESH_ENTITY_COUNT);
    }

    async function enableRefreshEntityCount() {
      _refreshEntityCountDisabled = false;
      await refreshEntityCount();
    }

    function disableRefreshEntityCount() {
      _refreshEntityCountDisabled = true;
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
      refreshEntityCount,
      enableRefreshEntityCount,
      disableRefreshEntityCount,
    });
  }

  return {
    start,
  };
}
