import SQL from './sql';

export default function(options = {}) {

  function start({ config, logger, namespace, account, release, deployment, db, }, cb) {

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
      ...namespace,
      ...account,
      ...release,
      ...deployment,
      db: config.unsafe ? db : undefined,
      nuke : config.unsafe ? nuke : undefined,
      logged: config.unsafe ? logged : undefined,
      unlogged: config.unsafe ? unlogged : undefined,
    });
  }

  return {
    start,
  };
}
