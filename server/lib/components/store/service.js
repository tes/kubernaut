import sqb from 'sqb';
import Service from '../../domain/Service';
import Registry from '../../domain/Registry';

export default function(options) {

  const { Op, raw } = sqb;

  function start({ config, logger, db }, cb) {

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
        .select('s.id', 's.name', 's.created_on', 's.created_by', 'sr.id registry_id', 'sr.name registry_name')
        .from('active_service__vw s', 'active_registry__vw sr')
        .where(Op.eq('s.registry', raw('sr.id')))
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

    function toService(row) {
      return new Service({
        id: row.id,
        name: row.name,
        createdOn: row.createdOn,
        createdBy: row.createdBy,
        registry: new Registry({
          id: row.registry_id,
          name: row.registry_name,
        }),
      });
    }

    return cb(null, {
      findServices,
      searchByServiceName,
    });
  }

  return {
    start,
  };
}
