import sqb from 'sqb';
import { v4 as uuid } from 'uuid';

import Job from '../../domain/Job';
import JobVersion from '../../domain/JobVersion';
import Account from '../../domain/Account';
import Cluster from '../../domain/Cluster';
import Namespace from '../../domain/Namespace';


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
        .select('j.id', 'j.name', 'j.created_on', 'j.created_by', 'a.display_name', 'n.id namespace_id', 'n.name namespace_name', 'n.color namespace_color', 'c.id cluster_id', 'c.name cluster_name', 'c.color cluster_color')
        .from('active_job__vw j')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('j.created_by', raw('a.id'))),
          innerJoin('active_namespace__vw n').on(Op.eq('j.namespace', raw('n.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id')))
        )
        .where(Op.eq('j.id', id));

      const result = await connection.query(db.serialize(builder, {}).sql);

      return result.rowCount ? toJob(result.rows[0]) : undefined;
    }


    const sortMapping = {
      name: 'j.name',
    };

    async function findJobs(criteria = {}, limit = 50, offset = 0, sort = 'name', order = 'asc') {
      logger.debug(`Listing up to ${limit} jobs starting from offset: ${offset}`);

      const sortColumn = sortMapping[sort] || 'j.name';
      const sortOrder = (order === 'asc' ? 'asc' : 'desc');

      const findJobsBuilder = sqb
        .select('j.id', 'j.name', 'j.created_on', 'j.created_by', 'a.display_name', 'n.id namespace_id', 'n.name namespace_name', 'n.color namespace_color', 'c.id cluster_id', 'c.name cluster_name', 'c.color cluster_color')
        .from('active_job__vw j')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('j.created_by', raw('a.id'))),
          innerJoin('active_namespace__vw n').on(Op.eq('j.namespace', raw('n.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('n.cluster', raw('c.id')))
        )
        .orderBy(`${sortColumn} ${sortOrder}`)
        .limit(limit)
        .offset(offset);

      const countJobsBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_job__vw j')
        .join(
          innerJoin('active_account__vw a').on(Op.eq('j.created_by', raw('a.id')))
        );

      if (criteria.filters) {
        if (criteria.filters.name) {
          db.applyFilter(criteria.filters.name, 'j.name', findJobsBuilder, countJobsBuilder);
        }
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
        .select('jv.id', 'jv.yaml', 'jv.created_on', 'jv.created_by', 'a.display_name')
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

        return db.withTransaction(async connection => {
          const findStatement = db.serialize(findVersionsBuilder, {});
          const countStatement = db.serialize(countVersionsBuilder, {});

          return Promise.all([
            connection.query(findStatement.sql, findStatement.values),
            connection.query(countStatement.sql, countStatement.values),
          ]).then(([findResult, countResult]) => {
            const items = findResult.rows.map(toJobVersion);
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

    async function saveJob(job, meta) {
      logger.debug(`Saving new job with name ${job.name} by account ${meta.account.id}`);

      return db.withTransaction(async connection => {
        const newJobId = uuid();

        const teamBuilder = sqb
          .insert('team', {
            id: newJobId,
            name: job.name,
            namespace: job.namespaceId,
            created_on: meta.date,
            created_by: meta.account.id,
          });

        await connection.query(db.serialize(teamBuilder, {}).sql);

        logger.debug(`Saved new job with id ${newJobId}`);
        return newJobId;
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
      });
    }

    function toJobVersion(row) {
      return new JobVersion({
        id: row.id,
        yaml: row.yaml,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
      });
    }

    cb(null, {
      getJob,
      findJobs,
      saveJob,
      findJobVersions,
    });
  }

  return {
    start,
  };

}
