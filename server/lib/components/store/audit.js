import sqb from 'sqb';
import { v4 as uuid } from 'uuid';
const { Op, raw } = sqb;
import AuditEntry from '../../domain/AuditEntry';
import Account from '../../domain/Account';

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
        team,
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
      if (team) toInsert.action_team = team.id;

      const builder = sqb.insert('audit', toInsert);
      await db.query(db.serialize(builder, {}).sql);
    }

    async function findAudits(criteria = {}, limit = 50, offset = 0) {
      logger.debug(`Listing up to ${limit} audit endtries from offset ${offset}`);

      const auditBuilder = sqb
        .select('au.id', 'au.created_on', 'au.action', 'a.id account_id', 'a.display_name account_display_name', 'au.action_secret_version', 'au.action_namespace', 'au.action_service', 'au.action_release', 'au.action_deployment', 'au.action_account', 'au.action_cluster', 'au.action_registry', 'au.action_team')
        .from('audit au')
        .join(sqb.join('account a').on(Op.eq('a.id', raw('au.account'))))
        .orderBy('au.created_on desc')
        .limit(limit)
        .offset(offset);

      const countBuilder = sqb
        .select(raw('count(*) count'))
        .from('audit au');

      if (criteria.filters) {
        if (criteria.filters.sourceAccount) {
          db.applyFilter(criteria.filters.sourceAccount, 'au.account', auditBuilder, countBuilder);
        }

        if (criteria.filters.secretVersion) {
          db.applyFilter(criteria.filters.secretVersion, 'au.action_secret_version', auditBuilder, countBuilder);
        }

        if (criteria.filters.namespace) {
          db.applyFilter(criteria.filters.namespace, 'au.action_namespace', auditBuilder, countBuilder);
        }

        if (criteria.filters.service) {
          db.applyFilter(criteria.filters.service, 'au.action_service', auditBuilder, countBuilder);
        }

        if (criteria.filters.release) {
          db.applyFilter(criteria.filters.release, 'au.action_release', auditBuilder, countBuilder);
        }

        if (criteria.filters.deployment) {
          db.applyFilter(criteria.filters.deployment, 'au.action_deployment', auditBuilder, countBuilder);
        }

        if (criteria.filters.account) {
          db.applyFilter(criteria.filters.account, 'au.action_account', auditBuilder, countBuilder);
        }

        if (criteria.filters.cluster) {
          db.applyFilter(criteria.filters.cluster, 'au.action_cluster', auditBuilder, countBuilder);
        }

        if (criteria.filters.registry) {
          db.applyFilter(criteria.filters.registry, 'au.action_registry', auditBuilder, countBuilder);
        }

        if (criteria.filters.team) {
          db.applyFilter(criteria.filters.team, 'au.action_team', auditBuilder, countBuilder);
        }

      }

      const [auditResults, countResults] = await db.withTransaction(connection => Promise.all([
        connection.query(db.serialize(auditBuilder, {}).sql),
        connection.query(db.serialize(countBuilder, {}).sql)
      ]));

      const items = auditResults.rows.map(toAuditEntry);
      const count = parseInt(countResults.rows[0].count, 10);

      logger.debug(`Returning ${items.length} of ${count} audit entries`);
      return { limit, offset, count, items };
    }

    function toAuditEntry(row) {
      return new AuditEntry({
        id: row.id,
        createdOn: row.created_on,
        action: row.action,
        sourceAccount: new Account({
          id: row.account_id,
          displayName: row.account_display_name,
        }),
        ids: {
          secretVersion: row.action_secret_version,
          namespace: row.action_namespace,
          service: row.action_service,
          release: row.action_release,
          deployment: row.action_deployment,
          account: row.action_account,
          cluster: row.action_cluster,
          registry: row.action_registry,
          team: row.action_team,
        }
      });
    }

    return cb(null, {
      audit,
      findAudits,
    });
  }

  return {
    start,
  };
}
