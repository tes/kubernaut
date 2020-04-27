import sqb from 'sqb';
import Promise from 'bluebird';
import Service from '../../domain/Service';
import Registry from '../../domain/Registry';
import Account from '../../domain/Account';
import Namespace from '../../domain/Namespace';
import Cluster from '../../domain/Cluster';

const { Op, raw, innerJoin } = sqb;

export default function(options) {


  function start({ config, logger, db, authz }, cb) {

    async function getService(id) {
      logger.debug(`Getting service by id ${id}`);
      const serviceBuilder = sqb
        .select('s.id', 's.name', 's.created_on', 's.created_by', 'sr.id registry_id', 'sr.name registry_name', 'a.display_name')
        .from('active_service__vw s', 'active_registry__vw sr', 'active_account__vw a')
        .where(Op.eq('s.registry', raw('sr.id')))
        .where(Op.eq('s.created_by', raw('a.id')))
        .where(Op.eq('s.id', id));

        const result = await db.query(db.serialize(serviceBuilder, {}).sql);
        logger.debug(`Found ${result.rowCount} services with id: ${id}`);
        return result.rowCount ? toService(result.rows[0]) : undefined;
    }

    async function searchByServiceName(searchFilter, registry) {
      logger.debug(`Search registry ${registry.id} for services with [${searchFilter}] in the name`);
      const searchBuilder = sqb
        .select('name')
        .from('active_service__vw')
        .where(Op.eq('registry', registry.id))
        .where(Op.like('name', `%${searchFilter}%`))
        .orderBy('name')
        .limit(5);

      const result = await db.query(db.serialize(searchBuilder, {}).sql);
      return result.rows;
    }

    async function findService(criteria) {
      const list = await findServices(criteria, 1, 0);
      if (list.count > 1) throw new Error(`Expected 0 or 1 services but found ${list.count}}`);
      return list.count === 1 ? list.items[0] : undefined;
    }

    const sortMapping = {
      createdOn: 's.created_on',
      createdBy: 'a.created_by',
      name: 's.name',
      registry: 'registry_name'
    };

    async function findServices(criteria = {}, limit = 50, offset = 0, sort = 'name', order = 'asc') {
      logger.debug(`Listing up to ${limit} services starting from offset: ${offset}`);

      const bindVariables = {};

      const sortColumn = sortMapping[sort] || 's.name';
      const sortOrder = (order === 'asc' ? 'asc' : 'desc');

      const findServicesBuilder = sqb
        .select('s.id', 's.name', 's.created_on', 's.created_by', 'sr.id registry_id', 'sr.name registry_name', 'a.display_name')
        .from('active_service__vw s')
        .join(
          innerJoin('active_registry__vw sr').on(Op.eq('s.registry', raw('sr.id'))),
          innerJoin('active_account__vw a').on(Op.eq('s.created_by', raw('a.id')))
        )
        .orderBy(`${sortColumn} ${sortOrder}`)
        .limit(limit)
        .offset(offset);

      const countServicesBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_service__vw s')
        .join(
          innerJoin('active_registry__vw sr').on(Op.eq('s.registry', raw('sr.id'))),
          innerJoin('active_account__vw a').on(Op.eq('s.created_by', raw('a.id')))
        );

      if (criteria.registries) {
        db.applyFilter({ value: criteria.registries }, 'sr.id', findServicesBuilder, countServicesBuilder);
      }

      if (criteria.filters) {
        if (criteria.filters.name) {
          db.applyFilter(criteria.filters.name, 's.name', findServicesBuilder, countServicesBuilder);
        }

        if (criteria.filters.registry) {
          db.applyFilter(criteria.filters.registry, 'sr.name', findServicesBuilder, countServicesBuilder);
        }

        if (criteria.filters.createdBy) {
          db.applyFilter(criteria.filters.createdBy, 'a.display_name', findServicesBuilder, countServicesBuilder);
        }
      }

      if (criteria.user) {
        const idsQuery = authz.querySubjectIdsWithPermission('registry', criteria.user.id, criteria.user.permission);
        [findServicesBuilder, countServicesBuilder].forEach(builder => builder.where(Op.in('sr.id', idsQuery)));
      }

      if (criteria.team) {
        const teamServicesBuilder = sqb
          .select('s.id')
          .from('active_team__vw t', 'team_service ts', 'active_service__vw s')
          .where(Op.eq('t.id', raw('ts.team')))
          .where(Op.eq('ts.service', raw('s.id')))
          .where(Op.eq('t.id', criteria.team.id))
          .orderBy('s.name');

        [findServicesBuilder, countServicesBuilder].forEach(builder => builder.where(Op.in('s.id', teamServicesBuilder)));
      }

      return db.withTransaction(async connection => {
        const findStatement = db.serialize(findServicesBuilder, bindVariables);
        const countStatement = db.serialize(countServicesBuilder, bindVariables);

        return Promise.all([
          connection.query(findStatement.sql, findStatement.values),
          connection.query(countStatement.sql, countStatement.values),
        ]).then(([findResult, countResult]) => {
          const items = findResult.rows.map(toService);
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} services`);

          return {
            limit,
            offset,
            count,
            items,
          };
        });
      });
    }

    async function checkServiceCanDeploytoNamespace(namespace, service) {
      logger.debug(`Checking service ${service.id} can deploy to namespace ${namespace.id}`);

      const findBuilder = sqb
        .select(raw('count(1) count'))
        .from('service_namespace sn')
        .where(Op.eq('sn.namespace', namespace.id))
        .where(Op.eq('sn.service', service.id))
        .where(Op.is('sn.deleted_on', null));

      const result = await db.query(db.serialize(findBuilder, {}).sql);

      const canDeploy = result.rows[0].count > 0;

      logger.debug(`service ${service.id} ${canDeploy ? 'can' : 'cannot'} be deployed to namespace ${namespace.id}`);

      return canDeploy;
    }

    async function findServicesAndShowStatusForNamespace(criteria = {}, limit = 20, offset = 0) {
      logger.debug(`Listing up to ${limit} services starting from offset: ${offset}`);

      const bindVariables = {};

      const findServicesBuilder = sqb
        .select(
          's.id',
          's.name',
          's.created_on',
          's.created_by',
          'sr.id registry_id',
          'sr.name registry_name',
          'a.display_name',
          sqb
            .select(raw('count(1) > 0'))
            .from('service_namespace sn')
            .where(Op.eq('sn.namespace', criteria.namespace))
            .where(Op.eq('sn.service', raw('s.id')))
            .where(Op.is('sn.deleted_on', null))
            .as('enabled')
        )
        .from('active_service__vw s', 'active_registry__vw sr', 'active_account__vw a')
        .where(Op.eq('s.registry', raw('sr.id')))
        .where(Op.eq('s.created_by', raw('a.id')))
        .orderBy('s.name asc')
        .limit(limit)
        .offset(offset);

      const countServicesBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_service__vw s', 'active_registry__vw sr')
        .where(Op.eq('s.registry', raw('sr.id')));

      if (criteria.registries) {
        db.buildWhereClause('sr.id', criteria.registries, bindVariables, findServicesBuilder, countServicesBuilder);
      }

      if (criteria.user) {
        const idsQuery = authz.querySubjectIdsWithPermission('registry', criteria.user.id, criteria.user.permission);
        [findServicesBuilder, countServicesBuilder].forEach(builder => builder.where(Op.in('sr.id', idsQuery)));
      }

      return db.withTransaction(async connection => {
        const findStatement = db.serialize(findServicesBuilder, bindVariables);
        const countStatement = db.serialize(countServicesBuilder, bindVariables);

        return Promise.all([
          connection.query(findStatement.sql, findStatement.values),
          connection.query(countStatement.sql, countStatement.values),
        ]).then(([findResult, countResult]) => {
          const items = findResult.rows.map(toServiceWithExtras({
            enabled: 'enabled',
          }));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} services`);

          return {
            limit,
            offset,
            count,
            items,
          };
        });
      });
    }

    async function deleteService(id, meta) {
      logger.debug(`Deleting service id: ${id}`);

      const builder = sqb
        .update('service', {
          deleted_on: meta.date,
          deleted_by: meta.account.id,
        })
        .where(Op.eq('id', id))
        .where(Op.is('deleted_on', null));

      await db.query(db.serialize(builder, {}).sql);

      logger.debug(`Deleted service, id: ${id}`);
    }

    async function serviceDeployStatusForNamespaces(serviceId, user, limit = 20, offset = 0) {
      logger.debug(`Retrieving service ${serviceId} deployable status for namespaces for user ${user.id}. Limited to ${limit} starting from ${offset}.`);

      const deployableBuilder = sqb
        .select(
          'n.id namespace_id',
          'n.name namespace_name',
          'n.color namespace_color',
          'c.name cluster_name',
          'c.color cluster_color',
          'c.priority cluster_priority',
        )
        .from('active_namespace__vw n')
        .join(sqb.join('cluster c').on(Op.eq('n.cluster', raw('c.id'))))
        .where(Op.in('n.id', authz.querySubjectIdsWithPermission('namespace', user.id, 'namespaces-manage')))
        .where(Op.in('n.id', sqb
          .select('sn.namespace')
          .from('service_namespace sn')
          .where(Op.eq('sn.service', serviceId))
          .where(Op.is('sn.deleted_on', null))
        ))
        .orderBy('namespace_name asc', 'cluster_priority asc', 'cluster_name asc');

      const findBuilder = sqb
        .select(
          'n.id namespace_id',
          'n.name namespace_name',
          'n.color namespace_color',
          'c.name cluster_name',
          'c.color cluster_color',
          'c.priority cluster_priority',
        )
        .from('active_namespace__vw n')
        .join(sqb.join('cluster c').on(Op.eq('n.cluster', raw('c.id'))))
        .where(Op.in('n.id', authz.querySubjectIdsWithPermission('namespace', user.id, 'namespaces-manage')))
        .where(Op.notIn('n.id', sqb
          .select('sn.namespace')
          .from('service_namespace sn')
          .where(Op.eq('sn.service', serviceId))
          .where(Op.is('sn.deleted_on', null))
        ))
        .orderBy('namespace_name asc', 'cluster_priority asc', 'cluster_name asc')
        .limit(limit)
        .offset(offset);

      const countBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_namespace__vw n')
        .where(Op.in('n.id', authz.querySubjectIdsWithPermission('namespace', user.id, 'namespaces-manage')))
        .where(Op.notIn('n.id', sqb
          .select('sn.namespace')
          .from('service_namespace sn')
          .where(Op.eq('sn.service', serviceId))
          .where(Op.is('sn.deleted_on', null))
        ));

        return db.withTransaction(async connection => {
          const findStatement = db.serialize(findBuilder, {});
          const deployableStatement = db.serialize(deployableBuilder, {});
          const countStatement = db.serialize(countBuilder, {});
          return Promise.all([
            connection.query(findStatement.sql, findStatement.values),
            connection.query(countStatement.sql, countStatement.values),
            connection.query(deployableStatement.sql, deployableStatement.values),
          ]).then(([findResult, countResult, deployableResult]) => {
            const deployable = deployableResult.rows.map(row => new Namespace({
              id: row.namespace_id,
              name: row.namespace_name,
              color: row.namespace_color,
              cluster: new Cluster({
                name: row.cluster_name,
                color: row.cluster_color,
              }),
            }));

            const items = findResult.rows.map(row => new Namespace({
              id: row.namespace_id,
              name: row.namespace_name,
              color: row.namespace_color,
              cluster: new Cluster({
                name: row.cluster_name,
                color: row.cluster_color,
              }),
            }));
            const count = parseInt(countResult.rows[0].count, 10);
            logger.debug(`Returning ${items.length} of ${count} namespaces service ${serviceId} can deploy to.`);

            return {
              limit,
              offset,
              count,
              items,
              deployable,
            };
          });
        });
    }

    async function getServiceAttributesForNamespace(service, namespace) {
      logger.debug(`Retrieving service attributes for ${service.id} on namespace ${namespace.id}`);
      const builder = sqb
        .select('name', 'value')
        .from('service_namespace_attribute')
        .where(Op.eq('service', service.id))
        .where(Op.eq('namespace', namespace.id));

      const result = await db.query(db.serialize(builder, {}).sql);
      logger.debug(`Found ${result.rowCount} attributes for ${service.id} on namespace ${namespace.id}`);
      if (!result.rowCount) return {};

      return result.rows.reduce((acc, row) => ({
        ...acc,
        [row.name]: row.value,
      }), {});
    }

    async function saveServiceAttributesForNamespace(service, namespace, attributes) {
      logger.debug(`Updating service attributes for ${service.id} on namespace ${namespace.id}`);

      const deleteBuilder = sqb
        .delete('service_namespace_attribute')
        .where(Op.eq('service', service.id))
        .where(Op.eq('namespace', namespace.id));

      const insertBuilders = [];
      for (const name in attributes) {
        insertBuilders.push(sqb
        .insert('service_namespace_attribute', {
          service: service.id,
          namespace: namespace.id,
          name,
          value: attributes[name],
        }));
      }
      await db.withTransaction(async connection => {
        await connection.query(db.serialize(deleteBuilder, {}).sql);

        await Promise.mapSeries(insertBuilders, async (insertBuilder) => {
          await connection.query(db.serialize(insertBuilder, {}).sql);
        });
      });

      return await getServiceAttributesForNamespace(service, namespace);
    }

    function toService(row) {
      return new Service({
        id: row.id,
        name: row.name,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
        registry: new Registry({
          id: row.registry_id,
          name: row.registry_name,
        }),
      });
    }

    function toServiceWithExtras(extrasMapping = {}) {
      return (row) => {
        const mapped = {
          service: toService(row),
        };

        Object.keys(extrasMapping).forEach((columnName) => {
          mapped[extrasMapping[columnName]] = row[columnName];
        });

        return mapped;
      };
    }

    return cb(null, {
      getService,
      findService,
      findServices,
      searchByServiceName,
      checkServiceCanDeploytoNamespace,
      findServicesAndShowStatusForNamespace,
      deleteService,
      serviceDeployStatusForNamespaces,
      getServiceAttributesForNamespace,
      saveServiceAttributesForNamespace,
    });
  }

  return {
    start,
  };
}
