import SQL from './sql';
import Namespace from '../../../domain/Namespace';
import Service from '../../../domain/Service';
import ReleaseTemplate from '../../../domain/ReleaseTemplate';
import Release from '../../../domain/Release';
import Account from '../../../domain/Account';

export default function(options) {

  function start({ config, logger, db, }, cb) {

    async function getRelease(id) {

      logger.debug(`Getting release by id: ${id}`);

      return Promise.all([
        db.query(SQL.SELECT_RELEASE_BY_ID, [id,]),
        db.query(SQL.LIST_RELEASE_ATTRIBUTES_BY_RELEASE, [id,]),
      ]).then(([releaseResult, attributesResult,]) => {
        logger.debug(`Found ${releaseResult.rowCount} releases with id: ${id}`);
        return releaseResult.rowCount ? toRelease(releaseResult.rows[0], attributesResult.rows) : undefined;
      });
    }

    async function findRelease({ name, namespace, version, }) {
      logger.debug(`Finding release by name: ${name}, namespace: ${namespace}, version: ${version}`);

      const release = await db.query(SQL.SELECT_RELEASE_BY_NAME_AND_VERSION, [
        name, namespace, version,
      ]);

      logger.debug(`Found ${release.rowCount} releases with name: ${name}, namespace: ${namespace}, version: ${version}`);

      if (release.rowCount === 0) return;

      const attributes = await db.query(SQL.LIST_RELEASE_ATTRIBUTES_BY_RELEASE, [release.rows[0].id,]);

      return toRelease(release.rows[0], attributes.rows);
    }

    async function saveRelease(data, meta) {
      const release = await db.withTransaction(async connection => {
        const service = await _ensureService(connection, data.service, data.service.namespace.name, meta);
        const template = await _ensureReleaseTemplate(connection, data.template, meta);
        const release = await _saveRelease(connection, service, template, data, meta);
        const attributes = await _saveReleaseAttributes(connection, release, data.attributes);
        return { ...release, service, template, attributes, };
      });

      await db.refreshEntityCount();

      return release;
    }

    async function _ensureService(connection, data, namespace, meta) {

      logger.debug(`Ensuring service: ${namespace}/${data.name}`);

      const result = await connection.query(SQL.ENSURE_SERVICE, [
        data.name, namespace, meta.date, meta.account.id,
      ]);

      const service = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Ensured service: ${namespace}/${service.name}/${service.id}`);

      return service;
    }

    async function _ensureReleaseTemplate(connection, data, meta) {

      logger.debug(`Ensuring release template: ${data.checksum}`);

      const result = await connection.query(SQL.ENSURE_RELEASE_TEMPLATE, [
        data.source.yaml, JSON.stringify(data.source.json), data.checksum, meta.date, meta.account.id,
      ]);

      const template = {
        ...data, id: result.rows[0].id,
      };

      logger.debug(`Ensured release template: ${template.checksum}/${template.id}`);

      return template;
    }

    async function _saveRelease(connection, service, template, data, meta) {

      logger.debug(`Saving release: ${service.name}/${data.version}`);

      const result = await connection.query(SQL.SAVE_RELEASE, [
        service.id, data.version, template.id, meta.date, meta.account.id,
      ]);

      const release = {
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      };

      logger.debug(`Saved release ${service.name}/${release.version}/${release.id}`);

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

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.LIST_RELEASES, [ limit, offset, ]),
          connection.query(SQL.COUNT_ACTIVE_ENTITIES, [ 'release', ]),
        ]).then(([releaseResult, countResult,]) => {
          const items = releaseResult.rows.map(row => toRelease(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} releases`);
          return { limit, offset, count, items, };
        });
      });
    }

    async function deleteRelease(id, meta) {
      logger.debug(`Deleting release id: ${id}`);
      await db.query(SQL.DELETE_RELEASE, [
        id, meta.date, meta.account.id,
      ]);
      await db.refreshEntityCount();
      logger.debug(`Deleted release id: ${id}`);
    }

    function toRelease(row, attributeRows = []) {
      return new Release({
        id: row.id,
        service: new Service({
          id: row.service_id,
          name: row.service_name,
          namespace: new Namespace({
            id: row.namespace_id,
            name: row.namespace_name,
          }),
        }),
        version: row.version,
        template: row.template_id ? new ReleaseTemplate({
          id: row.template_id,
          yaml: row.template_source_yaml,
          json: row.template_source_json,
          checksum: row.template_checksum,
        }) : undefined,
        attributes: attributeRows.reduce((attributes, row) => {
          return { ...attributes, [row.name]: row.value, };
        }, {}),
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
      });
    }

    return cb(null, {
      getRelease,
      findRelease,
      saveRelease,
      listReleases,
      deleteRelease,
    });
  }

  return {
    start,
  };
}
