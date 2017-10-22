import SQL from './sql';

export default function(options) {

  function start({ config, logger, postgres: db, }, cb) {

    async function getProfile(id) {

      logger.debug(`Getting profile by id: ${id}`);

      return await Promise.all([
        db.query(SQL.SELECT_PROFILE_BY_ID, [id,]),
        db.query(SQL.SELECT_PROFILE_ATTRIBUTES_BY_PROFILE, [id,]),
      ]).then(([profileResult, attributesResult,]) => {
        logger.debug(`Found ${profileResult.rowCount} profiles with id: ${id}`);
        return profileResult.rowCount ? toProfile(profileResult.rows[0], attributesResult.rows) : undefined;
      });
    }

    async function saveProfile(data, meta) {
      return await withTransaction(async connection => {
        const profile = await _saveProfile(connection, data, meta);
        const attributes = await _saveProfileAttributes(connection, profile, data.attributes);
        return { ...profile, attributes, };
      });
    }

    async function _saveProfile(connection, data, meta) {

      logger.debug(`Saving profile: ${data.name}, version: ${data.version}`);

      const result = await connection.query(SQL.SAVE_PROFILE, [
        data.name, data.version, meta.date, meta.user,
      ]);

      const profile = {
        ...data, id: result.rows[0].id,
      };

      logger.debug(`Saved profile: ${data.name}, version: ${profile.version} with id: ${profile.id}`);

      return profile;
    }

    async function _saveProfileAttributes(connection, profile, data) {

      const attributeNames = Object.keys(data);

      logger.debug(`Saving profile attributes: [ ${attributeNames.join(', ')} ] for profile id: ${profile.id}`);

      const attributes = attributeNames.map(name => ({
        name, value: data[name], profile: profile.id,
      }));

      await connection.query(SQL.SAVE_PROFILE_ATTRIBUTES, [JSON.stringify(attributes),]);

      logger.debug(`Saved profile attributes: [ ${attributeNames.join(', ')} ] for profile id: ${profile.id}`);

      return attributes;
    }

    async function listProfiles(limit = 50, offset = 0) {

      logger.debug(`Listing up to ${limit} profiles starting from offset: ${offset}`);

      const result = await db.query(SQL.LIST_PROFILES, [
        limit, offset,
      ]);

      logger.debug(`Found ${result.rowCount} profiles`);

      return result.rows.map(row => toProfile(row));
    }

    async function deleteProfile(id, meta) {
      logger.debug(`Deleting profile id: ${id}`);
      await db.query(SQL.DELETE_PROFILE, [
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

    function toProfile(row, attributeRows = []) {
      return {
        id: row.id,
        name: row.name,
        version: row.version,
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
      getProfile,
      saveProfile,
      listProfiles,
      deleteProfile,
    });
  }

  return {
    start,
  };
}
