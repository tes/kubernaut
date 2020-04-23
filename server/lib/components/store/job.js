import sqb from 'sqb';
import { v4 as uuid } from 'uuid';
import Promise from 'bluebird';

import Job from '../../domain/Job';
import JobVersion from '../../domain/JobVersion';
import Account from '../../domain/Account';
import Cluster from '../../domain/Cluster';
import Namespace from '../../domain/Namespace';
import Registry from '../../domain/Registry';


const { Op, raw, innerJoin } = sqb;

export default function() {
  function start({ logger, db, authz }, cb) {

    function getJob(id) {
      logger.debug(`Getting job by id ${id}`);

      return db.withTransaction(connection => {
        return _getJob(connection, id);
      });
    }

    async function _getJob(connection, id) {
      const builder = sqb
        .select('j.id', 'j.name', 'j.created_on', 'j.created_by', 'a.display_name', 'n.id namespace_id', 'n.name namespace_name', 'n.color namespace_color', 'c.id cluster_id', 'c.name cluster_name', 'c.color cluster_color', 'r.id registry_id', 'r.name registry_name')
        .from('active_job__vw j')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('j.created_by', raw('a.id'))),
          innerJoin('active_namespace__vw n').on(Op.eq('j.namespace', raw('n.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id'))),
          innerJoin('active_registry__vw r').on(Op.eq('j.registry', raw('r.id')))
        )
        .where(Op.eq('j.id', id));

      const result = await connection.query(db.serialize(builder, {}).sql);

      return result.rowCount ? toJob(result.rows[0]) : undefined;
    }

    function getJobVersion(id) {
      const versionBuilder = sqb
        .select('jv.id', 'jv.job', 'jv.yaml', 'jv.created_on', 'jv.created_by', 'jv.last_applied', 'a.display_name')
        .from('active_job_version__vw jv')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('jv.created_by', raw('a.id')))
        )
        .where(Op.eq('jv.id', id));

      return db.withTransaction(async connection => {
        const versionResult = await connection.query(db.serialize(versionBuilder, {}).sql);

        if (!versionResult.rowCount) return undefined;

        const job = await _getJob(connection, versionResult.rows[0].job);

        const latestAppliedBuilder = sqb
        .select('jv.id')
        .from('active_job_version__vw jv')
        .where(Op.eq('jv.job', job.id))
        .where(Op.not('jv.last_applied', null))
        .orderBy('jv.last_applied desc')
        .limit(1);

        const latestAppliedResult = await connection.query(db.serialize(latestAppliedBuilder, {}).sql);
        const latestAppliedId = latestAppliedResult.rowCount ? latestAppliedResult.rows[0].id : null;

        return toJobVersion(versionResult.rows[0], job, latestAppliedId);
      });
    }


    const sortMapping = {
      name: 'j.name',
    };

    async function findJobs(criteria = {}, limit = 50, offset = 0, sort = 'name', order = 'asc') {
      logger.debug(`Listing up to ${limit} jobs starting from offset: ${offset}`);

      const sortColumn = sortMapping[sort] || 'j.name';
      const sortOrder = (order === 'asc' ? 'asc' : 'desc');

      const findJobsBuilder = sqb
        .select('j.id', 'j.name', 'j.created_on', 'j.created_by', 'a.display_name', 'n.id namespace_id', 'n.name namespace_name', 'n.color namespace_color', 'c.id cluster_id', 'c.name cluster_name', 'c.color cluster_color', 'r.id registry_id', 'r.name registry_name')
        .from('active_job__vw j')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('j.created_by', raw('a.id'))),
          innerJoin('active_namespace__vw n').on(Op.eq('j.namespace', raw('n.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id'))),
          innerJoin('active_registry__vw r').on(Op.eq('j.registry', raw('r.id')))
        )
        .orderBy(`${sortColumn} ${sortOrder}`)
        .limit(limit)
        .offset(offset);

      const countJobsBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_job__vw j')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('j.created_by', raw('a.id'))),
          innerJoin('active_namespace__vw n').on(Op.eq('j.namespace', raw('n.id'))),
          innerJoin('active_registry__vw r').on(Op.eq('j.registry', raw('r.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id'))),
        );

      if (criteria.filters) {
        if (criteria.filters.name) {
          db.applyFilter(criteria.filters.name, 'j.name', findJobsBuilder, countJobsBuilder);
        }

        if (criteria.filters.namespace) {
          db.applyFilter(criteria.filters.namespace, 'n.name', findJobsBuilder, countJobsBuilder);
        }
        if (criteria.filters.cluster) {
          db.applyFilter(criteria.filters.cluster, 'c.name', findJobsBuilder, countJobsBuilder);
        }
      }

      if (criteria.user) {
        const idsQuery = authz.querySubjectIdsWithPermission('registry', criteria.user.id, criteria.user.permission);
        [findJobsBuilder, countJobsBuilder].forEach(builder => builder.where(Op.in('r.id', idsQuery)));
      }

      return db.withTransaction(async connection => {
        const findStatement = db.serialize(findJobsBuilder, {});
        const countStatement = db.serialize(countJobsBuilder, {});

        return Promise.all([
          connection.query(findStatement.sql, findStatement.values),
          connection.query(countStatement.sql, countStatement.values),
        ]).then(([findResult, countResult]) => {
          const items = findResult.rows.map(toJob);
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} jobs`);

          return {
            limit,
            offset,
            count,
            items,
          };
        });
      });
    }

    async function findJobVersions(job, limit = 50, offset = 0) {
      logger.debug(`Listing up to ${limit} job versions for job ${job.id} starting from offset: ${offset}`);

      const findVersionsBuilder = sqb
        .select('jv.id', 'jv.created_on', 'jv.created_by', 'jv.last_applied', 'a.display_name')
        .from('active_job_version__vw jv')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('jv.created_by', raw('a.id')))
        )
        .where(Op.eq('jv.job', job.id))
        .orderBy('jv.created_on desc')
        .limit(limit)
        .offset(offset);

      const countVersionsBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_job_version__vw jv')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('jv.created_by', raw('a.id')))
        )
        .where(Op.eq('jv.job', job.id));

      const latestAppliedBuilder = sqb
        .select('jv.id')
        .from('active_job_version__vw jv')
        .where(Op.eq('jv.job', job.id))
        .where(Op.not('jv.last_applied', null))
        .orderBy('jv.last_applied desc')
        .limit(1);

      return db.withTransaction(async connection => {
        const findStatement = db.serialize(findVersionsBuilder, {});
        const countStatement = db.serialize(countVersionsBuilder, {});
        const lastAppliedStatement = db.serialize(latestAppliedBuilder, {});

        return Promise.all([
          connection.query(findStatement.sql, findStatement.values),
          connection.query(countStatement.sql, countStatement.values),
          connection.query(lastAppliedStatement.sql, lastAppliedStatement.values),
        ]).then(([findResult, countResult, lastAppliedResult]) => {
          const latestAppliedId = lastAppliedResult.rowCount ? lastAppliedResult.rows[0].id : null;
          const items = findResult.rows.map((r) => toJobVersion(r, null, latestAppliedId));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} jobs`);

          return {
            limit,
            offset,
            count,
            items,
          };
        });
      });
    }

    async function saveJob(name, registry, namespace, meta) {
      logger.debug(`Saving new job with name ${name} in namespace ${namespace.id} by account ${meta.account.id}`);

      return db.withTransaction(async connection => {
        const newJobId = uuid();

        const builder = sqb
          .insert('job', {
            id: newJobId,
            name,
            registry: registry.id,
            namespace: namespace.id,
            created_on: meta.date,
            created_by: meta.account.id,
          });

        await connection.query(db.serialize(builder, {}).sql);

        logger.debug(`Saved new job with id ${newJobId}`);
        return newJobId;
      });
    }

    async function saveJobVersion(job, version, meta) {
      logger.debug(`Saving new version for job with name ${job.name} by account ${meta.account.id}`);

      return db.withTransaction(async connection => {
        const newJobVersionId = uuid();

        const builder = sqb
          .insert('job_version', {
            id: newJobVersionId,
            job: job.id,
            yaml: JSON.stringify(version.yaml),
            created_on: meta.date,
            created_by: meta.account.id,
          });

        await connection.query(db.serialize(builder, {}).sql);

        logger.debug(`Saved new job version with id ${newJobVersionId}`);
        return newJobVersionId;
      });
    }

    async function setJobVersionLastApplied(jobVersion, meta) {
      logger.debug(`Updating last applied for jobVersion ${jobVersion.id}`);

      const builder = sqb
        .update('job_version', {
          last_applied: meta.date,
        })
        .where(Op.eq('id', jobVersion.id));

      await db.query(db.serialize(builder, {}).sql);
      logger.debug(`Updated job version last applied for id ${jobVersion.id}`);
    }

    async function getJobVersionSecretWithData(joVersionId, meta, options = { opaque: false }) {
      logger.debug(`Retrieving jobVersion secret for ${joVersionId} for ${meta.account.id}`);
      const secretDataBuilder = sqb
        .select('jvd.key', 'jvd.value', 'jvd.editor')
        .from('job_secret_version_data jvd')
        .where(Op.eq('jvd.job_version', joVersionId))
        .orderBy('jvd.key');

      const data = await db.query(db.serialize(secretDataBuilder, {}).sql);

      return data.rows.map(row => ({
        ...row,
        value: options.opaque ? Buffer.from(JSON.parse(row.value)).toString('base64') : JSON.parse(row.value)
      }));
    }

    function saveJobVersionOfSecret(jobVersionId, versionData, meta) {
      logger.debug(`Saving version of secret for jobVersion ${jobVersionId} by account ${meta.account.id}`);
      return db.withTransaction(async connection => {
        const versionDataBuilders = versionData.secrets.map(secret => sqb
          .insert('job_secret_version_data', ({
            id: uuid(),
            job_version: jobVersionId,
            key: secret.key,
            value: JSON.stringify(secret.value),
            editor: secret.editor,
          })));
        await Promise.mapSeries(versionDataBuilders, async (versionDataBuilder) => {
          await connection.query(db.serialize(versionDataBuilder, {}).sql);
        });

        logger.debug(`Saved jobVersion secret for ${jobVersionId}`);
      });
    }

    function toJob(row) {
      return new Job({
        id: row.id,
        name: row.name,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
        namespace: new Namespace({
          id: row.namespace_id,
          name: row.namespace_name,
          context: row.namespace_context,
          color: row.namespace_color,
          cluster: new Cluster({
            id: row.cluster_id,
            name: row.cluster_name,
            color: row.cluster_color,
          }),
        }),
        registry: new Registry({
          id: row.registry_id,
          name: row.registry_name,
        }),
      });
    }

    function toJobVersion(row, job, latestAppliedId) {
      return new JobVersion({
        id: row.id,
        job,
        yaml: JSON.parse(row.yaml || '""'),
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
        lastApplied: row.last_applied,
        isLatestApplied: row.id === latestAppliedId,
      });
    }

    cb(null, {
      getJob,
      getJobVersion,
      findJobs,
      saveJob,
      saveJobVersion,
      findJobVersions,
      setJobVersionLastApplied,
      saveJobVersionOfSecret,
      getJobVersionSecretWithData,
    });
  }

  return {
    start,
  };

}
