import sqb from 'sqb';
import { v4 as uuid } from 'uuid';
import Promise from 'bluebird';
const { Op, raw } = sqb;

import Namespace from '../../domain/Namespace';
import Service from '../../domain/Service';
import Cluster from '../../domain/Cluster';
import Registry from '../../domain/Registry';
import Account from '../../domain/Account';
import SecretVersion from '../../domain/SecretVersion';


export default function(options) {

  function start({ config, logger, db }, cb)  {

    async function _getVersionOfSecretById(connection, id, meta) {
      const secretVersionBuilder = sqb
        .select('v.id', 'v.comment', 'v.created_on', 'v.created_by', 'a.display_name', 'v.service', 's.name service_name', 'sr.id registry_id', 'sr.name registry_name', 'v.namespace', 'n.name namespace_name', 'n.color namespace_color', 'c.id cluster_id', 'c.name cluster_name', 'c.color cluster_color')
        .from('secret_version v')
        .join(sqb.join('active_account__vw a').on(Op.eq('v.created_by', raw('a.id'))))
        .join(sqb.join('active_service__vw s').on(Op.eq('v.service', raw('s.id'))))
        .join(sqb.join('active_registry__vw sr').on(Op.eq('s.registry', raw('sr.id'))))
        .join(sqb.join('active_namespace__vw n').on(Op.eq('v.namespace', raw('n.id'))))
        .join(sqb.join('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id'))))
        .where(Op.eq('v.id', id));

      const result = await db.query(db.serialize(secretVersionBuilder, {}).sql);
      logger.debug(`Found ${result.rowCount} versions of secret with id: ${id}`);
      return result.rowCount ? toVersion(result.rows[0]) : undefined;
    }

    async function getVersionOfSecretById(id, meta) {
      logger.debug(`Retrieving secret version ${id} for ${meta.account.id}`);

      return db.withTransaction(async connection => {
        return _getVersionOfSecretById(connection, id, meta);
      });
    }

    async function getVersionOfSecretWithDataById(id, meta, options = { opaque: false }) {
      logger.debug(`Retrieving secret version ${id} for ${meta.account.id} with secret data`);
      const secretDataBuilder = sqb
        .select('vd.key', 'vd.value', 'vd.editor')
        .from('secret_version_data vd')
        .where(Op.eq('vd.version', id))
        .orderBy('vd.key');

      return db.withTransaction(async connection => {
        const [secret, data] = await Promise.all([
          _getVersionOfSecretById(connection, id, meta),
          connection.query(db.serialize(secretDataBuilder, {}).sql)
        ]);

        if (!secret) return undefined;

        secret.setSecrets(data.rows.map(row => ({
            ...row,
            value: options.opaque ? Buffer.from(JSON.parse(row.value)).toString('base64') : JSON.parse(row.value)
          })));

        return secret;
      });
    }

    async function getLatestDeployedSecretForReleaseToNamespace(release, namespace, meta) {
      logger.debug(`Fetching latest deployed secret to namespace ${namespace.id} for ${meta.account.id}`);
      const baseBuilder = () => sqb
        .select('da.value')
        .from('deployment_attribute da')
        .join(sqb.join('active_deployment__vw d').on(Op.eq('da.deployment', raw('d.id'))))
        .join(sqb.join('active_release__vw r').on(Op.eq('d.release', raw('r.id'))))
        .where(Op.eq('d.namespace', namespace.id))
        .where(Op.eq('r.service', release.service.id))
        .where(Op.eq('da.name', 'secret'))
        .orderBy('d.created_on desc')
        .limit(1);

      const releaseSpecificBuilder = baseBuilder().where(Op.eq('r.version', release.version));

      return db.withTransaction(async connection => {
        const [deploymentsResult, releaseResult] = await Promise.all([
          connection.query(db.serialize(baseBuilder(), {}).sql),
          connection.query(db.serialize(releaseSpecificBuilder, {}).sql),
        ]);
        if (!releaseResult.rowCount && !deploymentsResult.rowCount) return undefined;

        const { value: id } = releaseResult.rowCount ? releaseResult.rows[0] : deploymentsResult.rows[0];
        return await _getVersionOfSecretById(connection, id, meta);
      });
    }

    async function listVersionsOfSecret(service, namespace, meta, limit = 20, offset = 0) {
      logger.debug(`Listing up to ${limit} secret versions for service ${service.id} on namespace ${namespace.id} from offset ${offset} for account ${meta.account.id}`);

      const versionsBuilder = sqb
        .select('v.id', 'v.comment', 'v.created_on', 'v.created_by', 'a.display_name', 'v.service', 's.name service_name', 'sr.id registry_id', 'sr.name registry_name', 'v.namespace', 'n.name namespace_name', 'n.color namespace_color', 'c.id cluster_id', 'c.name cluster_name', 'c.color cluster_color')
        .from('secret_version v')
        .join(sqb.join('active_account__vw a').on(Op.eq('v.created_by', raw('a.id'))))
        .join(sqb.join('active_service__vw s').on(Op.eq('v.service', raw('s.id'))))
        .join(sqb.join('active_registry__vw sr').on(Op.eq('s.registry', raw('sr.id'))))
        .join(sqb.join('active_namespace__vw n').on(Op.eq('v.namespace', raw('n.id'))))
        .join(sqb.join('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id'))))
        .where(Op.eq('v.service', service.id))
        .where(Op.eq('v.namespace', namespace.id))
        .orderBy('v.created_on desc')
        .limit(limit)
        .offset(offset);

      const countBuilder = sqb
        .select(raw('count(*) count'))
        .from('secret_version v')
        .where(Op.eq('v.service', service.id))
        .where(Op.eq('v.namespace', namespace.id));

      return db.withTransaction(async connection => {
        const [findResult, countResult] = await Promise.all([
          connection.query(db.serialize(versionsBuilder, {}).sql),
          connection.query(db.serialize(countBuilder, {}).sql),
        ]);

        const items = findResult.rows.map(toVersion);
        const count = parseInt(countResult.rows[0].count, 10);
        logger.debug(`Returning ${items.length} of ${count} secret versions`);

        return {
          limit,
          offset,
          count,
          items,
        };
      });
    }

    async function saveVersionOfSecret(service, namespace, versionData, meta) {
      logger.debug(`Saving version of secret for service ${service.id} on namespace ${namespace.id} by account ${meta.account.id}`);
      return await db.withTransaction(async connection => {
        const newVersionId = uuid();
        const versionBuilder = sqb
          .insert('secret_version', {
            id: newVersionId,
            service: service.id,
            namespace: namespace.id,
            comment: versionData.comment,
            created_on: meta.date,
            created_by: meta.account.id,
          });

        await connection.query(db.serialize(versionBuilder, {}).sql);

        const versionDataBuilders = versionData.secrets.map(secret => sqb
          .insert('secret_version_data', ({
            id: uuid(),
            version: newVersionId,
            key: secret.key,
            value: JSON.stringify(secret.value),
            editor: secret.editor,
          })));
        await Promise.mapSeries(versionDataBuilders, async (versionDataBuilder) => {
          await connection.query(db.serialize(versionDataBuilder, {}).sql);
        });

        logger.debug(`Saved version of secret with id ${newVersionId}`);
        return newVersionId;
      });
    }

    function toVersion(row) {
      return new SecretVersion({
        id: row.id,
        comment: row.comment,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
        service: new Service({
          id: row.service,
          name: row.service_name,
          registry: new Registry({
            id: row.registry_id,
            name: row.registry_name,
          }),
        }),
        namespace: new Namespace({
          id: row.namespace,
          name: row.namespace_name,
          color: row.namespace_color,
          cluster: new Cluster({
            id: row.cluster_id,
            name: row.cluster_name,
            color: row.cluster_color,
          })
        })
      });
    }

    return cb(null, {
      saveVersionOfSecret,
      getVersionOfSecretById,
      getVersionOfSecretWithDataById,
      listVersionsOfSecret,
      getLatestDeployedSecretForReleaseToNamespace,
    });
  }

  return {
    start,
  };
}
