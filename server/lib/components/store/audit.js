import sqb from 'sqb';
import { v4 as uuid } from 'uuid';
// const { Op, raw } = sqb;

export default function(options) {

  function start({ config, logger, db }, cb)  {

    async function audit(meta, action, subjects = {}) {
      logger.debug(`Adding audit [${action}] for account ${meta.account.id}`);
      const {
        secretVersion,
        namespace,
        service,
        release,
        deployment,
        account,
        cluster,
        registry,
      } = subjects;

      const toInsert = {
        id: uuid(),
        account: meta.account.id,
        created_on: meta.date,
        action,
      };

      if (secretVersion) toInsert.action_secret_version = secretVersion.id;
      if (namespace) toInsert.action_namespace = namespace.id;
      if (service) toInsert.action_service = service.id;
      if (release) toInsert.action_release = release.id;
      if (deployment) toInsert.action_deployment = deployment.id;
      if (account) toInsert.action_account = account.id;
      if (cluster) toInsert.action_cluster = cluster.id;
      if (registry) toInsert.action_registry = registry.id;

      const builder = sqb.insert('audit', toInsert);
      await db.query(db.serialize(builder, {}).sql);
    }

    return cb(null, {
      audit,
    });
  }

  return {
    start,
  };
}
