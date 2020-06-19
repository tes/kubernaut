import sqb from 'sqb';
import { v4 as uuid } from 'uuid';
import Promise from 'bluebird';
import Account from '../../domain/Account';
import Cluster from '../../domain/Cluster';
import IngressHostKey from '../../domain/IngressHostKey';
import IngressVariableKey from '../../domain/IngressVariableKey';
import ClusterIngressHost from '../../domain/ClusterIngressHost';
import ClusterIngressVariable from '../../domain/ClusterIngressVariable';

const { Op, raw, innerJoin } = sqb;

export default function() {

  function start({ logger, db }, cb) {

    function getIngressHostKey(id) {
      return db.withTransaction(connection => {
        return _getIngressHostKey(connection, id);
      });
    }

    async function _getIngressHostKey(connection, id) {
      const builder = sqb
        .select('ihk.id', 'ihk.name', 'ihk.created_by', 'a.display_name', 'ihk.created_on')
        .from('active_ingress_host_key__vw ihk')
        .join(
          innerJoin('account a').on(Op.eq('ihk.created_by', raw('a.id')))
        )
        .where(Op.eq('ihk.id', id));

      const result = await connection.query(db.serialize(builder, {}).sql);

      return result.rowCount ? toIngressHostKey(result.rows[0]) : undefined;
    }

    function getIngressVariableKey(id) {
      return db.withTransaction(connection => {
        return _getIngressVariableKey(connection, id);
      });
    }

    async function _getIngressVariableKey(connection, id) {
      const builder = sqb
        .select('ivk.id', 'ivk.name', 'ivk.created_by', 'a.display_name', 'ivk.created_on')
        .from('active_ingress_variable_key__vw ivk')
        .join(
          innerJoin('account a').on(Op.eq('ivk.created_by', raw('a.id')))
        )
        .where(Op.eq('ivk.id', id));

      const result = await connection.query(db.serialize(builder, {}).sql);

      return result.rowCount ? toIngressVariableKey(result.rows[0]) : undefined;
    }

    function getClusterIngressHost(id) {
      return db.withTransaction(connection => {
        return _getClusterIngressHost(connection, id);
      });
    }

    async function _getClusterIngressHost(connection, id) {
      const builder = sqb
        .select('cih.id', 'cih.value', 'cih.created_by', 'a.display_name', 'ivk.created_on', 'c.id cluster_id', 'c.name cluster_name', 'cih.ingress_host_key', 'ihk.name ingress_host_key_name')
        .from('active_cluster_ingress_host__vw cih')
        .join(
          innerJoin('account a').on(Op.eq('cih.created_by', raw('a.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('cih.cluster', raw('c.id'))),
          innerJoin('active_ingress_host_key__vw ihk').on(Op.eq('cih.ingress_host_key', raw('ihk.id')))
        )
        .where(Op.eq('cih.id', id));

      const result = await connection.query(db.serialize(builder, {}).sql);

      return result.rowCount ? toClusterIngressHost(result.rows[0]) : undefined;
    }

    function getClusterIngressVariable(id) {
      return db.withTransaction(connection => {
        return _getClusterIngressVariable(connection, id);
      });
    }

    async function _getClusterIngressVariable(connection, id) {
      const builder = sqb
        .select('civ.id', 'civ.value', 'civ.created_by', 'a.display_name', 'ivk.created_on', 'c.id cluster_id', 'c.name cluster_name', 'civ.ingress_host_variable', 'ihv.name ingress_host_variable_name')
        .from('active_cluster_ingress_variable__vw civ')
        .join(
          innerJoin('account a').on(Op.eq('civ.created_by', raw('a.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('civ.cluster', raw('c.id'))),
          innerJoin('active_ingress_host_variable__vw ihv').on(Op.eq('civ.ingress_host_variable', raw('ihv.id')))
        )
        .where(Op.eq('civ.id', id));

      const result = await connection.query(db.serialize(builder, {}).sql);

      return result.rowCount ? toClusterIngressVariable(result.rows[0]) : undefined;
    }

    function findIngressHostKeys(limit = 50, offset = 0) {
      const builder = sqb
        .select('ihk.id', 'ihk.name', 'ihk.created_by', 'a.display_name', 'ihk.created_on')
        .from('active_ingress_host_key__vw ihk')
        .join(
          innerJoin('account a').on(Op.eq('ihk.created_by', raw('a.id')))
        )
        .orderBy('ihk.name')
        .limit(limit)
        .offset(offset);

      const countBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_ingress_host_key__vw');

      return db.withTransaction(async connection => {
        const [result, countResult] = await Promise.all([
          connection.query(db.serialize(builder, {}).sql),
          connection.query(db.serialize(countBuilder, {}).sql)
        ]);

        const items = result.rows.map(toIngressHostKey);
        const count = parseInt(countResult.rows[0].count, 10);
        return { limit, offset, count, items };
      });
    }

    function findIngressVariableKeys(limit = 50, offset = 0) {
      const builder = sqb
        .select('ivk.id', 'ivk.name', 'ivk.created_by', 'a.display_name', 'ivk.created_on')
        .from('active_ingress_variable_key__vw ivk')
        .join(
          innerJoin('account a').on(Op.eq('ivk.created_by', raw('a.id')))
        )
        .orderBy('ivk.name')
        .limit(limit)
        .offset(offset);

      const countBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_ingress_host_key__vw');

      return db.withTransaction(async connection => {
        const [result, countResult] = await Promise.all([
          connection.query(db.serialize(builder, {}).sql),
          connection.query(db.serialize(countBuilder, {}).sql)
        ]);

        const items = result.rows.map(toIngressHostKey);
        const count = parseInt(countResult.rows[0].count, 10);
        return { limit, offset, count, items };
      });
    }

    function findClusterIngressHosts(criteria = {}, limit = 50, offset = 0) {
      const builder = sqb
        .select('cih.id', 'cih.value', 'cih.created_by', 'a.display_name', 'ivk.created_on', 'c.id cluster_id', 'c.name cluster_name', 'cih.ingress_host_key', 'ihk.name ingress_host_key_name')
        .from('active_cluster_ingress_host__vw cih')
        .join(
          innerJoin('account a').on(Op.eq('cih.created_by', raw('a.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('cih.cluster', raw('c.id'))),
          innerJoin('active_ingress_host_key__vw ihk').on(Op.eq('cih.ingress_host_key', raw('ihk.id')))
        )
        .orderBy('cih.name')
        .limit(limit)
        .offset(offset);

      const countBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_cluster_ingress_host__vw cih')
        .join(
          innerJoin('active_cluster__vw c').on(Op.eq('cih.cluster', raw('c.id'))),
          innerJoin('active_ingress_host_key__vw ihk').on(Op.eq('cih.ingress_host_key', raw('ihk.id')))
        );

      if(criteria.cluster) {
        [builder, countBuilder].forEach(builder => builder.where(Op.eq('c.id', criteria.cluster)));
      }

      return db.withTransaction(async connection => {
        const [result, countResult] = await Promise.all([
          connection.query(db.serialize(builder, {}).sql),
          connection.query(db.serialize(countBuilder, {}).sql)
        ]);

        const items = result.rows.map(toClusterIngressHost);
        const count = parseInt(countResult.rows[0].count, 10);
        return { limit, offset, count, items };
      });
    }

    function findClusterIngressVariables(criteria = {}, limit = 50, offset = 0) {
      const builder = sqb
        .select('civ.id', 'civ.value', 'civ.created_by', 'a.display_name', 'ivk.created_on', 'c.id cluster_id', 'c.name cluster_name', 'civ.ingress_variable_key', 'ihv.name ingress_host_variable_name')
        .from('active_cluster_ingress_variable__vw civ')
        .join(
          innerJoin('account a').on(Op.eq('civ.created_by', raw('a.id'))),
          innerJoin('active_cluster__vw c').on(Op.eq('civ.cluster', raw('c.id'))),
          innerJoin('active_ingress_host_variable__vw ihv').on(Op.eq('civ.ingress_variable_key', raw('ihv.id')))
        )
        .orderBy('civ.name')
        .limit(limit)
        .offset(offset);

      const countBuilder = sqb
        .select(raw('count(*) count'))
        .from('active_cluster_ingress_variable__vw civ')
        .join(
          innerJoin('active_cluster__vw c').on(Op.eq('civ.cluster', raw('c.id'))),
          innerJoin('active_ingress_host_variable__vw ihv').on(Op.eq('civ.ingress_variable_key', raw('ihv.id')))
        );

      if(criteria.cluster) {
        [builder, countBuilder].forEach(builder => builder.where(Op.eq('c.id', criteria.cluster)));
      }

      return db.withTransaction(async connection => {
        const [result, countResult] = await Promise.all([
          connection.query(db.serialize(builder, {}).sql),
          connection.query(db.serialize(countBuilder, {}).sql)
        ]);

        const items = result.rows.map(toClusterIngressVariable);
        const count = parseInt(countResult.rows[0].count, 10);
        return { limit, offset, count, items };
      });
    }

    function saveIngressHostKey(name, meta) {
      return db.withTransaction(async connection => {
        const newId = uuid();

        const builder = sqb
          .insert('ingress_host_key', {
            id: newId,
            name,
            created_on: meta.date,
            created_by: meta.account.id,
          });

        await connection.query(db.serialize(builder, {}).sql);

        return newId;
      });
    }

    function saveIngressVariableKey(name, meta) {
      return db.withTransaction(async connection => {
        const newId = uuid();

        const builder = sqb
          .insert('ingress_variable_key', {
            id: newId,
            name,
            created_on: meta.date,
            created_by: meta.account.id,
          });

        await connection.query(db.serialize(builder, {}).sql);

        return newId;
      });
    }

    function saveClusterIngressHostValue(ingressHostKey, cluster, value, meta) {
      const newId = uuid();

      const builder = sqb
        .insert('cluster_ingress_host', {
            id: newId,
            ingress_host_key: ingressHostKey.id,
            cluster: cluster.id,
            value,
            created_on: meta.date,
            created_by: meta.account.id,
        });

      return db.withTransaction(async connection => {
        await connection.query(db.serialize(builder, {}).sql);

        return newId;
      });
    }

    function saveClusterIngressVariableValue (ingressHostVariable, cluster, value, meta) {
      const newId = uuid();

      const builder = sqb
        .insert('cluster_ingress_variable', {
            id: newId,
            ingress_host_variable: ingressHostVariable.id,
            cluster: cluster.id,
            value,
            created_on: meta.date,
            created_by: meta.account.id,
        });

      return db.withTransaction(async connection => {
        await connection.query(db.serialize(builder, {}).sql);

        return newId;
      });
    }

    function updateClusterIngressHostValue(clusterIngressHostValueId, value) {
      const builder = sqb
        .update('cluster_ingress_host', {
          value,
        })
        .where(Op.eq('id', clusterIngressHostValueId));

      return db.withTransaction(async connection => {
        await connection.query(db.serialize(builder, {}).sql);

        return _getClusterIngressHost(connection, clusterIngressHostValueId);
      });
    }

    function updateClusterIngressVariableValue (clusterIngressVariableValueId, value) {
      const builder = sqb
        .update('cluster_ingress_variable', {
          value,
        })
        .where(Op.eq('id', clusterIngressVariableValueId));

      return db.withTransaction(async connection => {
        await connection.query(db.serialize(builder, {}).sql);

        return _getClusterIngressVariable(connection, clusterIngressVariableValueId);
      });
    }

    function toIngressHostKey(row) {
      return new IngressHostKey({
        id: row.id,
        name: row.name,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
      });
    }

    function toIngressVariableKey(row) {
      return new IngressVariableKey({
        id: row.id,
        name: row.name,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
      });
    }

    function toClusterIngressHost(row) {
      return new ClusterIngressHost({
        id: row.id,
        value: row.value,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
        cluster: new Cluster({
          id: row.cluster_id,
          name: row.cluster_name,
        }),
        ingressHostKey: new IngressHostKey({
          id: row.ingress_host_key,
          name: row.ingress_host_key_name,
        }),
      });
    }

    function toClusterIngressVariable(row) {
      return new ClusterIngressVariable({
        id: row.id,
        value: row.value,
        createdOn: row.created_on,
        createdBy: new Account({
          id: row.created_by,
          displayName: row.display_name,
        }),
        cluster: new Cluster({
          id: row.cluster_id,
          name: row.cluster_name,
        }),
        ingressHostVariable: new IngressVariableKey({
          id: row.ingress_variable_key,
          name: row.ingress_host_variable_name,
        }),
      });
    }

    cb(null, {
      getIngressHostKey,
      getIngressVariableKey,
      getClusterIngressHost,
      getClusterIngressVariable,
      findIngressHostKeys,
      findIngressVariableKeys,
      findClusterIngressHosts,
      findClusterIngressVariables,
      saveIngressHostKey,
      saveIngressVariableKey,
      saveClusterIngressHostValue,
      saveClusterIngressVariableValue,
      updateClusterIngressHostValue,
      updateClusterIngressVariableValue,
    });
  }

  return {

    start,

  };

}
