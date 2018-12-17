import SQL from './sql';
import Account from '../../domain/Account';
import Registry from '../../domain/Registry';
import Service from '../../domain/Service';
import Release from '../../domain/Release';
import Manifest from '../../domain/Manifest';
import Cluster from '../../domain/Cluster';
import Namespace from '../../domain/Namespace';
import Deployment from '../../domain/Deployment';
import DeploymentLogEntry from '../../domain/DeploymentLogEntry';
import sqb from 'sqb';

export default function(options) {

  function start({ config, logger, db, authz }, cb) {

    const { Op, raw, join } = sqb;

    async function saveDeployment(data, meta) {
      return await db.withTransaction(async connection => {
        const deployment = await _saveDeployment(connection, data, meta);
        const attributes = await _saveDeploymentAttributes(connection, deployment, data.attributes);
        return new Deployment({ ...deployment, attributes });
      });
    }

    async function _saveDeployment(connection, data, meta) {
      logger.debug(`Saving deployment: ${data.release.id}/${data.namespace.cluster.name}/${data.namespace.name}`);

      const result = await connection.query(SQL.SAVE_DEPLOYMENT, [
        data.release.id, data.namespace.id, data.manifest.yaml, JSON.stringify(data.manifest.json), meta.date, meta.account.id,
      ]);

      const deployment = new Deployment({
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      });

      logger.debug(`Saved deployment:  ${deployment.release.id}/${deployment.namespace.cluster.name}${deployment.namespace.name}/${deployment.id}`);

      return deployment;
    }

    async function _saveDeploymentAttributes(connection, deployment, data) {

      const attributeNames = Object.keys(data);

      logger.debug(`Saving deployment attributes: [ ${attributeNames.join(', ')} ] for deployment id: ${deployment.id}`);

      const attributes = attributeNames.map(name => ({
        name, value: data[name], deployment: deployment.id,
      }));

      await connection.query(SQL.SAVE_DEPLOYMENT_ATTRIBUTES, [JSON.stringify(attributes)]);

      logger.debug(`Saved deployment attributes: [ ${attributeNames.join(', ')} ] for deployment id: ${deployment.id}`);

      return attributes;
    }

    async function saveApplyExitCode(id, code) {
      logger.debug(`Saving apply exit code to ${code} for ${id}`);

      const result = await db.query(SQL.SAVE_DEPLOYMENT_APPLY_EXIT_CODE, [
        id, code,
      ]);

      if (result.rowCount !== 1) throw new Error(`Deployment ${id} was not updated`);

      logger.debug(`Saved apply exit code to ${code} for ${id}`);
    }

    async function saveRolloutStatusExitCode(id, code) {
      logger.debug(`Saving rollout status exit code to ${code} for ${id}`);

      const result = await db.query(SQL.SAVE_DEPLOYMENT_ROLLOUT_STATUS_EXIT_CODE, [
        id, code,
      ]);

      if (result.rowCount !== 1) throw new Error(`Deployment ${id} was not updated`);

      logger.debug(`Saved rollout status exit code to ${code} for ${id}`);
    }

    async function saveDeploymentLogEntry(data) {
      logger.debug(`Saving deployment log entry: ${data.deployment.id}`);

      const result = await db.query(SQL.SAVE_DEPLOYMENT_LOG_ENTRY, [
        data.deployment.id, data.writtenOn, data.writtenTo, data.content,
      ]);

      const deploymentLogEntry = new DeploymentLogEntry({
        ...data, id: result.rows[0].id,
      });

      logger.debug(`Saved deployment log entry: ${data.deployment.id}/${deploymentLogEntry.id}`);

      return deploymentLogEntry;
    }

    async function getDeployment(id) {
      logger.debug(`Getting deployment by id: ${id}`);

      return await db.withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.SELECT_DEPLOYMENT_BY_ID, [id]),
          connection.query(SQL.LIST_DEPLOYMENT_ATTRIBUTES_BY_DEPLOYMENT, [id]),
          connection.query(SQL.LIST_DEPLOYMENT_LOG_ENTRIES_BY_DEPLOYMENT, [id]),
        ]).then(([deploymentResult, attributesResults, logEntriesResult]) => {
          logger.debug(`Found ${deploymentResult.rowCount} deployments with id: ${id}`);
          return deploymentResult.rowCount ? toDeployment(deploymentResult.rows[0], attributesResults.rows, logEntriesResult.rows) : undefined;
        });
      });
    }

    async function findLatestDeploymentsByNamespaceForService(registryId, service, user) {
      logger.debug(`Getting latest deployment per namespace for service: ${service} for user ${user.id}`);

      const builder = sqb
        .select(raw(`
          distinct
            d.namespace namespace_id,
            n.name namespace_name,
            n.color namespace_color,
            c.name cluster_name,
            c.color cluster_color,
            LAST_VALUE(r.id) OVER ( PARTITION BY d.namespace ORDER BY d.created_on ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) release_id,
            LAST_VALUE(r.version) OVER ( PARTITION BY d.namespace ORDER BY d.created_on ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) release_version
          `))
        .from('deployment d')
        .join(join('release r').on(Op.eq('r.id', raw('d.release'))))
        .join(join('service s').on(Op.eq('s.id', raw('r.service'))))
        .join(join('registry sr').on(Op.eq('sr.id', raw('s.registry'))))
        .join(join('namespace n').on(Op.eq('n.id', raw('d.namespace'))))
        .join(join('cluster c').on(Op.eq('c.id', raw('n.cluster'))))
        .where(Op.eq('sr.id', registryId))
        .where(Op.eq('s.name', service))
        .where(Op.in('d.namespace', await authz.querySubjectIdsWithPermission('namespace', user.id, 'deployments-read')));

      return await db.withTransaction(async connection => {
        return await connection.query(db.serialize(builder, {}).sql);
      }).then((result) => {
        logger.debug(`Found ${result.rowCount} namespaces with deployments for ${service}`);
        return result.rows.map(toLatestDeployment);
      });
    }

    const sortMapping = (sort, order) => {
      const sortOrder = (order === 'asc' ? 'asc' : 'desc');

      switch(sort) {
        case 'service': return `s.name ${sortOrder}, d.created_on desc`;
        case 'version': return `r.version ${sortOrder}, d.created_on desc`;
        case 'where': return `c.name ${sortOrder}, n.name ${sortOrder}, d.created_on desc`;
        case 'createdBy': return `cb.display_name ${sortOrder}, d.created_on desc`;
        case 'created':
        default: return `d.created_on ${sortOrder}, d.id desc`;
      }
    };

    async function findDeployments(criteria = {}, limit = 50, offset = 0, sort = 'created', order = 'desc') {

      logger.debug(`Listing up to ${limit} deploymentss starting from offset: ${offset}`);

      const bindVariables = {};

      const findDeploymentsBuilder = sqb
        .select('d.id', 'd.apply_exit_code', 'd.rollout_status_exit_code', 'd.created_on', 'd.note', 'r.id release_id', 'r.version release_version', 's.id service_id', 's.name service_name', 'sr.id registry_id', 'sr.name registry_name', 'n.id namespace_id', 'n.name namespace_name', 'n.color namespace_color', 'c.id cluster_id', 'c.name cluster_name', 'c.config cluster_config', 'c.color cluster_color', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_deployment__vw d', 'release r', 'service s', 'registry sr', 'cluster c', 'namespace n', 'account cb')
        .where(Op.eq('d.release', raw('r.id')))
        .where(Op.eq('r.service', raw('s.id')))
        .where(Op.eq('s.registry', raw('sr.id')))
        .where(Op.eq('d.namespace', raw('n.id')))
        .where(Op.eq('n.cluster', raw('c.id')))
        .where(Op.eq('d.created_by', raw('cb.id')))
        .orderBy(raw(sortMapping(sort, order)))
        .limit(limit)
        .offset(offset);

      const countDeploymentsBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_deployment__vw d', 'release r', 'service s', 'registry sr', 'cluster c', 'namespace n')
        .where(Op.eq('d.release', raw('r.id')))
        .where(Op.eq('r.service', raw('s.id')))
        .where(Op.eq('s.registry', raw('sr.id')))
        .where(Op.eq('d.namespace', raw('n.id')))
        .where(Op.eq('n.cluster', raw('c.id')));

      if (criteria.hasOwnProperty('service')) {
        db.applyFilter({ value: criteria.service }, 's.name', findDeploymentsBuilder, countDeploymentsBuilder);
      }

      if (criteria.hasOwnProperty('namespace')) {
        db.applyFilter({ value: criteria.namespace }, 'n.name', findDeploymentsBuilder, countDeploymentsBuilder);
      }

      if (criteria.hasOwnProperty('cluster')) {
        db.applyFilter({ value: criteria.cluster }, 'c.name', findDeploymentsBuilder, countDeploymentsBuilder);
      }

      if (criteria.hasOwnProperty('namespaces')) {
        db.applyFilter({ value: criteria.namespaces }, 'n.id', findDeploymentsBuilder, countDeploymentsBuilder);
      }

      if(criteria.hasOwnProperty('hasNotes')) {
        const stringOp = criteria.hasNotes ? Op.ne : Op.eq;
        const nullOp = criteria.hasNotes ? Op.not : Op.is;
        const groupOp = criteria.hasNotes ? Op.and : Op.or;
        const op = groupOp(nullOp('d.note', null), stringOp('d.note', ''), stringOp('d.note', '""'));
        [findDeploymentsBuilder, countDeploymentsBuilder].forEach(b => b.where(op));
      }

      if (criteria.filters) {
        if (criteria.filters.service) {
          db.applyFilter(criteria.filters.service, 's.name', findDeploymentsBuilder, countDeploymentsBuilder);
        }

        if (criteria.filters.version) {
          db.applyFilter(criteria.filters.version, 'r.version', findDeploymentsBuilder, countDeploymentsBuilder);
        }

        if (criteria.filters.namespace) {
          db.applyFilter(criteria.filters.namespace, 'n.name', findDeploymentsBuilder, countDeploymentsBuilder);
        }

        if (criteria.filters.cluster) {
          db.applyFilter(criteria.filters.cluster, 'c.name', findDeploymentsBuilder, countDeploymentsBuilder);
        }

        if (criteria.filters.namespaces) {
          db.applyFilter(criteria.filters.namespace, 'n.id', findDeploymentsBuilder, countDeploymentsBuilder);
        }
      }

      if (criteria.user && criteria.user.namespace) {
        const idsQuery = authz.querySubjectIdsWithPermission('namespace', criteria.user.id, criteria.user.namespace.permission);
        [findDeploymentsBuilder, countDeploymentsBuilder].forEach(builder => builder.where(Op.in('n.id', idsQuery)));
      }

      if (criteria.user && criteria.user.registry) {
        const idsQuery = authz.querySubjectIdsWithPermission('registry', criteria.user.id, criteria.user.registry.permission);
        [findDeploymentsBuilder, countDeploymentsBuilder].forEach(builder => builder.where(Op.in('sr.id', idsQuery)));
      }

      return db.withTransaction(async connection => {
        const findDeploymentsStatement = db.serialize(findDeploymentsBuilder, bindVariables);
        const countDeploymentsStatement = db.serialize(countDeploymentsBuilder, bindVariables);

        return Promise.all([
          connection.query(findDeploymentsStatement.sql, findDeploymentsStatement.values),
          connection.query(countDeploymentsStatement.sql, countDeploymentsStatement.values),
        ]).then(([deploymentsResult, countResult]) => {
          const items = deploymentsResult.rows.map(row => toDeployment(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} deployments`);
          return { limit, offset, count, items };
        });
      });
    }

    async function deleteDeployment(id, meta) {
      logger.debug(`Deleting deployment id: ${id}`);
      await db.query(SQL.DELETE_DEPLOYMENT, [
        id, meta.date, meta.account.id,
      ]);
    }

    async function setDeploymentNote(id, note) {
      const updateBuilder = sqb
        .update('deployment d', { note: JSON.stringify(note) })
        .where(Op.eq('d.id', id));

      await db.query(db.serialize(updateBuilder, {}).sql);
      logger.debug(`set deployment note for ${id}`);
      return await getDeployment(id);
    }

    function toLatestDeployment(row) {
      return {
        namespace: new Namespace({
          id: row.namespace_id,
          name: row.namespace_name,
          color: row.namespace_color,
          cluster: new Cluster({
            name: row.cluster_name,
            color: row.cluster_color,
          }),
        }),
        cluster: new Cluster({
          name: row.cluster_name,
          color: row.cluster_color,
        }),
        release: new Release({
          id: row.release_id,
          version: row.release_version
        }),
      };
    }

    function toDeployment(row, attributeRows = [], logRows = []) {
      return new Deployment({
        id: row.id,
        namespace: new Namespace({
          id: row.namespace_id,
          name: row.namespace_name,
          context: row.namespace_context,
          color: row.namespace_color,
          cluster: new Cluster({
            id: row.cluster_id,
            name: row.cluster_name,
            config: row.cluster_config,
            color: row.cluster_color,
          }),
        }),
        manifest: new Manifest({
          yaml: row.manifest_yaml,
          json: row.manifest_json,
        }),
        applyExitCode: row.apply_exit_code,
        rolloutStatusExitCode: row.rollout_status_exit_code,
        log: logRows.map(row => {
          return new DeploymentLogEntry({
            id: row.id,
            writtenOn: row.written_on,
            writtenTo: row.written_to,
            content: row.content,
          });
        }),
        release: new Release({
          id: row.release_id,
          service: new Service({
            id: row.service_id,
            name: row.service_name,
            registry: new Registry({
              id: row.registry_id,
              name: row.registry_name,
            }),
          }),
          version: row.release_version,
        }),
        attributes: attributeRows.reduce((attributes, row) => {
          return { ...attributes, [row.name]: row.value };
        }, {}),
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
        note: row.note && JSON.parse(row.note),
      });
    }

    return cb(null, {
      saveDeployment,
      saveApplyExitCode,
      saveRolloutStatusExitCode,
      saveDeploymentLogEntry,
      getDeployment,
      findLatestDeploymentsByNamespaceForService,
      findDeployments,
      deleteDeployment,
      setDeploymentNote,
    });
  }

  return {
    start,
  };
}
