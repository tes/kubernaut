import sqb from 'sqb';

import { v4 as uuid } from 'uuid';

import Promise from 'bluebird';

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
        .select('ihk.id', 'ihk.name', 'a.display_name', 'ihk.created_on')
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
        .select('ivk.id', 'ivk.name', 'a.display_name', 'ivk.created_on')
        .from('active_ingress_variable_key__vw ivk')
        .join(
          innerJoin('account a').on(Op.eq('ivk.created_by', raw('a.id')))
        )
        .where(Op.eq('ivk.id', id));

        const result = await connection.query(db.serialize(builder, {}).sql);

        return result.rowCount ? toIngressVariableKey(result.rows[0]) : undefined;
    }

    function findIngressHostKeys(limit = 50, offset = 0) {
      const builder = sqb
        .select('ihk.id', 'ihk.name', 'a.display_name', 'ihk.created_on')
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
        .select('ivk.id', 'ivk.name', 'a.display_name', 'ivk.created_on')
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

    function toIngressHostKey(row) {
      return row;
    }

    function toIngressVariableKey(row) {
      return row;
    }

    cb(null, {
      getIngressHostKey,
      getIngressVariableKey,
      findIngressHostKeys,
      findIngressVariableKeys,
      saveIngressHostKey,
      saveIngressVariableKey,
    });
  }

  return {

    start,

  };

}
