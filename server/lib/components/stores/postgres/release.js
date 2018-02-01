import SQL from './sql';
import Namespace from '../../../domain/Namespace';
import Service from '../../../domain/Service';
import ReleaseTemplate from '../../../domain/ReleaseTemplate';
import Release from '../../../domain/Release';
import Account from '../../../domain/Account';
import sqb from 'sqb';

export default function(options) {

  function start({ config, logger, db, }, cb) {

    const { Op, raw, } = sqb;

    async function saveRelease(data, meta) {
      const release = await db.withTransaction(async connection => {
        const service = await _ensureService(connection, data.service, data.service.registry.name, meta);
        const template = await _ensureReleaseTemplate(connection, data.template, meta);
        const release = await _saveRelease(connection, service, template, data, meta);
        const attributes = await _saveReleaseAttributes(connection, release, data.attributes);
        return { ...release, service, template, attributes, };
      });

      return release;
    }

    async function _ensureService(connection, data, registry, meta) {

      logger.debug(`Ensuring service: ${registry}/${data.name}`);

      const result = await connection.query(SQL.ENSURE_SERVICE, [
        data.name, registry, meta.date, meta.account.id,
      ]);

      const service = new Service({
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      });

      logger.debug(`Ensured service: ${registry}/${service.name}/${service.id}`);

      return service;
    }

    async function _ensureReleaseTemplate(connection, data, meta) {

      logger.debug(`Ensuring release template: ${data.checksum}`);

      const result = await connection.query(SQL.ENSURE_RELEASE_TEMPLATE, [
        data.source.yaml, JSON.stringify(data.source.json), data.checksum, meta.date, meta.account.id,
      ]);

      const template = new ReleaseTemplate({
        ...data, id: result.rows[0].id,
      });

      logger.debug(`Ensured release template: ${template.checksum}/${template.id}`);

      return template;
    }

    async function _saveRelease(connection, service, template, data, meta) {

      logger.debug(`Saving release: ${service.name}/${data.version}`);

      const result = await connection.query(SQL.SAVE_RELEASE, [
        service.id, data.version, template.id, meta.date, meta.account.id,
      ]);

      const release = new Release({
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      });

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

    async function getRelease(id) {

      logger.debug(`Getting release by id: ${id}`);

      return await db.withTransaction(async connection => {
        return Promise.all([
          connection.query(SQL.SELECT_RELEASE_BY_ID, [id,]),
          connection.query(SQL.LIST_RELEASE_ATTRIBUTES_BY_RELEASE, [id,]),
        ]).then(([releaseResult, attributesResult,]) => {
          logger.debug(`Found ${releaseResult.rowCount} releases with id: ${id}`);
          return releaseResult.rowCount ? toRelease(releaseResult.rows[0], attributesResult.rows) : undefined;
        });
      });
    }

    async function findRelease(criteria) {
      const list = await findReleases(criteria, 1, 0);
      if (list.count > 1) throw new Error(`Expected 0 or 1 releases but found ${list.count}}`);
      if (list.count === 0) return;
      return getRelease(list.items[0].id); // Lazy way to get release attributes
    }

    async function findReleases(criteria = {}, limit = 50, offset = 0) {

      logger.debug(`Listing up to ${limit} releases starting from offset: ${offset}`);

      const bindVariables = {};

      const findReleasesBuilder = sqb
        .select('r.id', 'r.version', 'r.created_on', 's.id service_id', 's.name service_name', 'sr.id registry_id', 'sr.name registry_name', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_release__vw r', 'service s', 'registry sr', 'account cb')
        .where(Op.eq('r.service', raw('s.id')))
        .where(Op.eq('s.registry', raw('sr.id')))
        .where(Op.eq('r.created_by', raw('cb.id')))
        .orderBy('r.created_on desc', 'r.id desc')
        .limit(limit)
        .offset(offset);

      const countReleasesBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_release__vw r', 'service s', 'registry sr')
        .where(Op.eq('r.service', raw('s.id')))
        .where(Op.eq('s.registry', raw('sr.id')));

      if (criteria.hasOwnProperty('version')) {
        db.buildWhereClause('r.version', criteria.version, bindVariables, findReleasesBuilder, countReleasesBuilder);
      }

      if (criteria.hasOwnProperty('service')) {
        db.buildWhereClause('s.name', criteria.service, bindVariables, findReleasesBuilder, countReleasesBuilder);
      }

      if (criteria.hasOwnProperty('registry')) {
        db.buildWhereClause('sr.name', criteria.registry, bindVariables, findReleasesBuilder, countReleasesBuilder);
      }

      if (criteria.hasOwnProperty('registries')) {
        db.buildWhereClause('sr.id', criteria.registries, bindVariables, findReleasesBuilder, countReleasesBuilder);
      }

      const findReleasesStatement = db.serialize(findReleasesBuilder, bindVariables);
      const countReleasesStatement = db.serialize(countReleasesBuilder, bindVariables);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(findReleasesStatement.sql, findReleasesStatement.values),
          connection.query(countReleasesStatement.sql, countReleasesStatement.values),
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
      logger.debug(`Deleted release id: ${id}`);
    }

    function toRelease(row, attributeRows = []) {
      return new Release({
        id: row.id,
        service: new Service({
          id: row.service_id,
          name: row.service_name,
          registry: new Namespace({
            id: row.registry_id,
            name: row.registry_name,
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
      saveRelease,
      getRelease,
      findRelease,
      findReleases,
      deleteRelease,
    });
  }

  return {
    start,
  };
}
