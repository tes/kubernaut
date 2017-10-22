import SQL from './sql';

export default function(options) {

  function start({ config, logger, postgres: db, }, cb) {

    async function getRelease(id) {

      logger.debug(`Getting release by id: ${id}`);

      return await Promise.all([
        db.query(SQL.SELECT_RELEASE_BY_ID, [id,]),
        db.query(SQL.SELECT_RELEASE_ATTRIBUTES_BY_RELEASE, [id,]),
      ]).then(([releaseResult, attributesResult,]) => {
        logger.debug(`Found ${releaseResult.rowCount} releases with id: ${id}`);
        return releaseResult.rowCount ? toRelease(releaseResult.rows[0], attributesResult.rows) : undefined;
      });
    }

    async function saveRelease(data, meta) {
      return await withTransaction(async connection => {
        const service = await _ensureService(connection, data.service, meta);
        const template = await _ensureReleaseTemplate(connection, data.template, meta);
        const release = await _saveRelease(connection, service, template, data, meta);
        const attributes = await _saveReleaseAttributes(connection, release, data.attributes);
        return { ...release, service, template, attributes, };
      });
    }

    async function _ensureService(connection, data, meta) {

      logger.debug(`Ensuring service: ${data.name}`);

      const result = await connection.query(SQL.ENSURE_SERVICE, [
        data.name, meta.date, meta.user,
      ]);

      const service = {
        ...data, id: result.rows[0].id,
      };

      logger.debug(`Ensured service: ${service.name} with id: ${service.id}`);

      return service;
    }

    async function _ensureReleaseTemplate(connection, data, meta) {

      logger.debug(`Ensuring release template with checksum: ${data.checksum}`);

      const result = await connection.query(SQL.ENSURE_RELEASE_TEMPLATE, [
        data.source, data.checksum, meta.date, meta.user,
      ]);

      const template = {
        ...data, id: result.rows[0].id,
      };

      logger.debug(`Ensured release template with checksum ${template.checksum} and id: ${template.id}`);

      return template;
    }

    async function _saveRelease(connection, service, template, data, meta) {

      logger.debug(`Saving release: ${service.name}, version: ${data.version}`);

      const result = await connection.query(SQL.SAVE_RELEASE, [
        service.id, data.version, template.id, meta.date, meta.user,
      ]);

      const release = {
        ...data, id: result.rows[0].id,
      };

      logger.debug(`Saved release: ${service.name}, version: ${release.version} with id: ${release.id}`);

      return release;
    }

    async function _saveReleaseAttributes(connection, release, data) {

      const attributeNames = Object.keys(data);

      logger.debug(`Saving release attributes: [ ${attributeNames.join(', ')} ] for release id: ${release.id}`);

      const attributes = attributeNames.map(name => ({
        name, value: data[name], release: release.id,
      }));

      await connection.query(SQL.SAVE_RELEASE_ATTRIBUTES, [JSON.stringify(attributes),]);

      logger.debug(`Saved release attributes: [ ${attributeNames.join(', ')} ] for release id: ${release.id}`);

      return attributes;
    }

    async function listReleases(limit = 50, offset = 0) {

      logger.debug(`Listing up to ${limit} releases starting from offset: ${offset}`);

      const result = await db.query(SQL.LIST_RELEASES, [
        limit, offset,
      ]);

      logger.debug(`Found ${result.rowCount} releases`);

      return result.rows.map(row => toRelease(row));
    }

    async function deleteRelease(id, meta) {
      logger.debug(`Deleting release id: ${id}`);
      await db.query(SQL.DELETE_RELEASE, [
        id,
        meta.date,
        meta.user,
      ]);
    }

    async function withTransaction(operations) {
      logger.debug(`Retrieving db client from the pool`);

      const connection = await db.connect();
      try {
        await connection.query('BEGIN');
        const result = await operations(connection);
        await connection.query('COMMIT');
        return result;
      } catch (err) {
        await connection.query('ROLLBACK');
        throw err;
      } finally {
        logger.debug(`Returning db client to the pool`);
        connection.release();
      }
    }

    function toRelease(row, attributeRows = []) {
      return {
        id: row.id,
        service: {
          id: row.service_id,
          name: row.service_name,
        },
        version: row.version,
        template: row.template_id ? {
          id: row.template_id,
          source: row.template_source,
          checksum: row.template_checksum,
        } : undefined,
        createdOn: row.created_on,
        createdBy: row.created_by,
        deletedOn: row.deleted_on,
        deletedBy: row.deleted_by,
        attributes: attributeRows.reduce((attributes, row) => {
          return { ...attributes, [row.name]: row.value, };
        }, {}),
      };
    }

    return cb(null, {
      getRelease,
      saveRelease,
      listReleases,
      deleteRelease,
    });
  }

  return {
    start,
  };
}
