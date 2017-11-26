import pg from 'systemic-pg/pg';

/*
Multi tenancy is user so we can run tests in parallel
*/

export default function() {

  async function start({ config, logger, }, cb) {
    if (!config.tenant) return cb(null, config);
    let client;
    try {
      logger.info(`Switching connection to user: ${config.tenant.user}`);
      client = new pg.Client(config);
      await client.connect();
      const exists = await client.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [ config.tenant.user, ]);
      if (!exists.rowCount) await client.query(`CREATE USER ${config.tenant.user} WITH SUPERUSER PASSWORD '${config.tenant.password}'`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${config.tenant.user}`);
    } catch (err) {
      return cb(err);
    } finally {
      if (client) await client.end();
    }

    cb(null, {
      ...config,
      user: config.tenant.user,
      password: config.tenant.password,
    });
  }

  return {
    start,
  };

}
