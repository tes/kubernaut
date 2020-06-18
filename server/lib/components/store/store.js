import SQL from './sql';

export default function(options = {}) {

  function start(deps, cb) {

    const {
      config,
      account,
      registry,
      release,
      cluster,
      namespace,
      deployment,
      service,
      secret,
      team,
      audit,
      job,
      ingress,
      db,
    } = deps;

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
      ...registry,
      ...release,
      ...cluster,
      ...namespace,
      ...deployment,
      ...service,
      ...secret,
      ...team,
      ...audit,
      ...job,
      ...ingress,
      nuke : config.unsafe ? nuke : undefined,
      logged: config.unsafe ? logged : undefined,
      unlogged: config.unsafe ? unlogged : undefined,
    });
  }

  return {
    start,
  };
}
