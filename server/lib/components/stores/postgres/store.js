import SQL from './sql';

export default function(options = {}) {

  function start({ config, logger, account, release, deployment, postgres: db, }, cb) {

    db.on('error', err => {
      logger.warn(err, 'Database client errored and was evicted from the pool');
    });

    async function nuke() {
      await db.query(SQL.NUKE);
    }

    async function logged() {
      await db.query(SQL.SET_LOGGED);
    }

    async function unlogged() {
      await db.query(SQL.SET_UNLOGGED);
    }

    cb(null, {
      ...account,
      ...release,
      ...deployment,
      nuke : config.unsafe ? nuke : undefined,
      logged: config.unsafe ? logged : undefined,
      unlogged: config.unsafe ? unlogged : undefined,
    });
  }

  return {
    start,
  };
}
