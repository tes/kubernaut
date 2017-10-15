import SQL from './sql';

export default function(options) {

  function start({ config, logger, postgres: db, }, cb) {

    async function getRelease(id) {

      logger.debug(`Getting release by id: ${id}`);

      return Promise.all([
        db.query(SQL.SELECT_RELEASE_BY_ID, [id,]),
        db.query(SQL.SELECT_RELEASE_ATTRIBUTES_BY_RELEASE, [id,]),
      ]).then(([releaseResult, attributesResult,]) => {
        logger.debug(`Found ${releaseResult.rowCount} releases with id: ${id}`);
        if (!releaseResult.rowCount) return;
        return toRelease(releaseResult.rows[0], attributesResult.rows);
      });
    }

    async function saveRelease(release, meta) {
      return await withTransaction(async connection => {
        await _saveRelease(connection, release, meta);
        await _saveReleaseAttributes(connection, release);
      });
    }

    async function _saveRelease(connection, release, meta) {

      logger.debug(`Saving release id: ${release.id}, version: ${release.version}`);

      await connection.query(SQL.SAVE_RELEASE, [
        release.id,
        release.name,
        release.version,
        release.description,
        release.template,
        meta.date,
        meta.user,
      ]);
    }

    async function _saveReleaseAttributes(connection, release) {

      const attributeNames = Object.keys(release.attributes);

      logger.debug(`Saving attributes [ ${attributeNames.join(', ')} ] for release id: ${release.id}`);

      const attributes = attributeNames
        .map(name => ({
          name,
          value: release.attributes[name],
          release: release.id,
        }));

      await connection.query(SQL.SAVE_RELEASE_ATTRIBUTES, [JSON.stringify(attributes),]);

      return;
    }

    async function listReleases(limit = 50, offset = 0) {
      logger.debug('Listing releases');
      const result = await db.query(SQL.LIST_RELEASES, [
        limit,
        offset,
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

    async function nuke() {
      await db.query(SQL.NUKE);
    }

    function toRelease(row, attributeRows = []) {
      return {
        id: row.id,
        name: row.name,
        version: row.version,
        description: row.description,
        template: row.template,
        createdOn: row.created_on,
        createdBy: row.created_by,
        deletedOn: row.deleted_on,
        deletedBy: row.deleted_by,
        attributes: attributeRows.reduce((attributes, row) => {
          return { ...attributes, [row.name]: row.value, };
        }, {}),
      };
    }

    db.on('error', err => {
      logger.warn(err, 'Database client errored and was evicted from the pool');
    });

    return cb(null, {
      getRelease,
      saveRelease,
      listReleases,
      deleteRelease,
      nuke : config.nukeable ? nuke : undefined,
    });
  }

  return {
    start,
  };
}
