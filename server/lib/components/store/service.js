import sqb from 'sqb';
import Service from '../../domain/Service';
import Registry from '../../domain/Registry';
import Account from '../../domain/Account';

export default function(options) {

  const { Op, raw } = sqb;

  function start({ config, logger, db }, cb) {

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

    async function findServices(criteria = {}, limit = 50, offset = 0) {
      logger.debug(`Listing up to ${limit} services starting from offset: ${offset}`);

      const bindVariables = {};

      const findServicesBuilder = sqb
        .select('s.id', 's.name', 's.created_on', 's.created_by', 'sr.id registry_id', 'sr.name registry_name', 'a.display_name')
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

      const findStatement = db.serialize(findServicesBuilder, bindVariables);
      const countStatement = db.serialize(countServicesBuilder, bindVariables);

      return db.withTransaction(async connection => {
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

      const findStatement = db.serialize(findServicesBuilder, bindVariables);
      const countStatement = db.serialize(countServicesBuilder, bindVariables);

      return db.withTransaction(async connection => {
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
      findServices,
      searchByServiceName,
      checkServiceCanDeploytoNamespace,
      findServicesAndShowStatusForNamespace,
    });
  }

  return {
    start,
  };
}
