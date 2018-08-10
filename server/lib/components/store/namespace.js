import { v4 as uuid } from 'uuid';
import SQL from './sql';
import Namespace from '../../domain/Namespace';
import Account from '../../domain/Account';
import sqb from 'sqb';

export default function(options) {

  const { Op, raw } = sqb;

  function start({ config, logger, db }, cb) {

    async function getNamespace(id) {
      logger.debug(`Getting namespace by id: ${id}`);

      const selectNamespaceBuilder = sqb
        .select('n.id', 'n.name', 'n.context', 'n.created_on', 'n.color', 'c.id cluster_id', 'c.name cluster_name', 'c.config cluster_config', 'c.color cluster_color', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_namespace__vw n', 'account cb', 'cluster c')
        .where(Op.eq('n.id', id))
        .where(Op.eq('n.cluster', raw('c.id')))
        .where(Op.eq('n.created_by', raw('cb.id')));

      const selectNamespaceAttributeBuilder = sqb
        .select('na.name', 'na.value', 'na.namespace')
        .from('namespace_attribute na')
        .where(Op.eq('na.namespace', id))
        .orderBy('na.name asc');

      return await db.withTransaction(async connection =>
        await Promise.all([
          connection.query(db.serialize(selectNamespaceBuilder, {}).sql),
          connection.query(db.serialize(selectNamespaceAttributeBuilder, {}).sql),
        ]).then(([namespaceResult, namespaceAttributeResult]) => {
          logger.debug(`Found ${namespaceResult.rowCount} namespaces with id: ${id}`);
          return namespaceResult.rowCount ?
            toNamespace(namespaceResult.rows[0], namespaceAttributeResult.rows)
            : undefined;
        }));
    }

    async function saveNamespace(data, meta) {
      const namespaceId = await db.withTransaction(async connection => {
        const namespace = await _saveNamespace(connection, data, meta);
        await _saveNamespaceAttributes(connection, namespace, data.attributes || {});
        return namespace.id;
      });
      return await getNamespace(namespaceId);
    }

    async function _saveNamespace(connection, data, meta) {
      logger.debug(`Saving namespace: ${data.cluster.id}/${data.name}`);

      const result = await connection.query(SQL.SAVE_NAMESPACE, [
        data.name, data.cluster.id, data.context, data.color, meta.date, meta.account.id,
      ]);

      const namespace = new Namespace({
        ...data, id: result.rows[0].id, createdOn: meta.date, createdBy: meta.account.id,
      });

      logger.debug(`Saved namespace:${data.cluster.id}/${namespace.name}/${namespace.id}`);

      return namespace;
    }

    async function _saveNamespaceAttributes(connection, namespace, data) {
      const attributeNames = Object.keys(data);

      logger.debug(`Saving namespace attributes: [ ${attributeNames.join(', ')} ] for namespace id: ${namespace.id}`);

      const attributes = attributeNames.map(name => ({
        name, value: data[name], namespace: namespace.id,
      }));

      await connection.query(SQL.SAVE_NAMESPACE_ATTRIBUTES, [JSON.stringify(attributes)]);

      logger.debug(`Saved namespace attributes: [ ${attributeNames.join(', ')} ] for namespace id: ${namespace.id}`);

      return attributes;
    }

    async function updateNamespace(id, data) {
      const { attributes = {}, ...updates } = data;
      await db.withTransaction(async connection => {
        await _updateNamespace(connection, id, updates);
        await _updateNamespaceAttributes(connection, id, attributes);
      });
      return await getNamespace(id);
    }

    async function _updateNamespace(connection, id, data) {
      if (Object.keys(data).length === 0) return;
      logger.debug(`Updating namespace: ${id}`);
      const updateBuilder = sqb
        .update('namespace n', data)
        .where(Op.eq('n.id', id));

      const result = await connection.query(db.serialize(updateBuilder, {}).sql);
      logger.debug(`Updated namespace:${id}`);
      return result;
    }

    async function _updateNamespaceAttributes(connection, namespaceId, attributes) {
      logger.debug(`Updating namespace attributes: ${namespaceId}`);
      const deleteBuilder = sqb
        .delete('namespace_attribute')
        .where(Op.eq('namespace', namespaceId));

      await connection.query(db.serialize(deleteBuilder, {}).sql);
      return await _saveNamespaceAttributes(connection, { id: namespaceId }, attributes);
    }

    async function findNamespace(criteria) {
      const list = await findNamespaces(criteria, 1, 0);
      if (list.count > 1) throw new Error(`Expected 0 or 1 namespaces but found ${list.count}}`);
      return list.count === 1 ? list.items[0] : undefined;
    }

    async function findNamespaces(criteria = {}, limit = 50, offset = 0) {

      logger.debug(`Finding up to ${limit} namespaces matching criteria: ${JSON.stringify(criteria)} starting from offset: ${offset}`);

      const bindVariables = {};

      const findNamespacesBuilder = sqb
        .select('n.id', 'n.name', 'n.context', 'n.color', 'n.created_on', 'c.id cluster_id', 'c.name cluster_name', 'c.config cluster_config', 'cb.id created_by_id', 'cb.display_name created_by_display_name')
        .from('active_namespace__vw n', 'cluster c', 'account cb')
        .where(Op.eq('n.cluster', raw('c.id')))
        .where(Op.eq('n.created_by', raw('cb.id')))
        .orderBy('n.name asc', 'c.name asc')
        .limit(limit)
        .offset(offset);

      const countNamespacesBuilder = sqb
        .select(raw('count(*)'))
        .from('active_namespace__vw n', 'cluster c')
        .where(Op.eq('n.cluster', raw('c.id')));

      if (criteria.hasOwnProperty('ids')) {
        db.buildWhereClause('n.id', criteria.ids, bindVariables, findNamespacesBuilder, countNamespacesBuilder);
      }

      if (criteria.hasOwnProperty('name')) {
        db.buildWhereClause('n.name', criteria.name, bindVariables, findNamespacesBuilder, countNamespacesBuilder);
      }

      if (criteria.hasOwnProperty('cluster')) {
        db.buildWhereClause('c.name', criteria.cluster, bindVariables, findNamespacesBuilder, countNamespacesBuilder);
      }

      const findNamespacesStatement = db.serialize(findNamespacesBuilder, bindVariables);
      const countNamespacesStatement = db.serialize(countNamespacesBuilder, bindVariables);

      return db.withTransaction(async connection => {
        return Promise.all([
          connection.query(findNamespacesStatement.sql, findNamespacesStatement.values),
          connection.query(countNamespacesStatement.sql, countNamespacesStatement.values),
        ]).then(([namespaceResult, countResult]) => {
          const items = namespaceResult.rows.map(row => toNamespace(row));
          const count = parseInt(countResult.rows[0].count, 10);
          logger.debug(`Returning ${items.length} of ${count} namespaces`);
          return { limit, offset, count, items };
        });
      });
    }

    async function deleteNamespace(id, meta) {
      logger.debug(`Deleting namespace id: ${id}`);
      await db.query(SQL.DELETE_NAMESPACE, [
        id, meta.date, meta.account.id,
      ]);
      logger.debug(`Deleted namespace id: ${id}`);
    }

    async function enableServiceForNamespace(namespace, service, meta) {
      logger.debug(`Enabling service ${service.id} to deploy to namespace ${namespace.id}`);

      const findBuilder = sqb
        .select(raw('count(1) count'))
        .from('service_namespace sn')
        .where(Op.eq('sn.namespace', namespace.id))
        .where(Op.eq('sn.service', service.id))
        .where(Op.is('sn.deleted_on', null));

      const insertBuilder = sqb
        .insert('service_namespace', {
          id: uuid(),
          namespace: namespace.id,
          service: service.id,
          created_by: meta.account.id,
          created_on: meta.date,
        });

      await db.withTransaction(async (connection) => {
        const alreadyExistsResult = await connection.query(db.serialize(findBuilder, {}).sql);
        const alreadyExists = alreadyExistsResult.rows[0].count > 0;
        if (alreadyExists) {
          logger.debug(`Service ${service.id} already could deploy to namespace ${namespace.id}`);
          return;
        }

        await connection.query(db.serialize(insertBuilder, {}).sql);
        logger.debug(`Service ${service.id} can now deploy to namespace ${namespace.id}`);
      });
    }

    function toNamespace(row, attributeRows = []) {
      return new Namespace({
        id: row.id,
        name: row.name,
        context: row.context,
        color: row.color,
        cluster: {
          id: row.cluster_id,
          name: row.cluster_name,
          config: row.cluster_config,
          color: row.cluster_color,
        },
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by_id,
          displayName: row.created_by_display_name,
        }),
        attributes: attributeRows.reduce((attributes, row) => {
          return { ...attributes, [row.name]: row.value };
        }, {}),
      });
    }

    return cb(null, {
      getNamespace,
      findNamespace,
      findNamespaces,
      saveNamespace,
      deleteNamespace,
      updateNamespace,
      enableServiceForNamespace,
    });
  }

  return {
    start,
  };
}
