import SQL from './sql';

export default function(options = {}) {

  function start({ config, logger, profile, release, postgres: db, }, cb) {

    db.on('error', err => {
      logger.warn(err, 'Database client errored and was evicted from the pool');
    });

    async function nuke() {
      await db.query(SQL.NUKE);
    }

    cb(null, {
      ...profile,
      ...release,
      nuke : config.nukeable ? nuke : undefined,
    });
  }

  return {
    start,
  };
}
