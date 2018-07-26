import sqb from 'sqb';

export default function(options) {

  const { Op } = sqb;

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

    return cb(null, {
      searchByServiceName,
    });
  }

  return {
    start,
  };
}
