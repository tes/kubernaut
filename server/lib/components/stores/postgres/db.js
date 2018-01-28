import { v4 as uuid, } from 'uuid';
import sqb from 'sqb';
import sqbpg from 'sqb-serializer-pg';

sqb.use(sqbpg);

export default function(options = {}) {

  function start({ config = {}, logger, postgres, }, cb) {

    const { Op, } = sqb;

    postgres.on('error', err => {
      logger.warn(err, 'Database client errored and was evicted from the pool');
    });

    async function query(...args) {
      return postgres.query.apply(postgres, args);
    }

    async function withTransaction(operations) {
      const connection = await postgres.connect();
      try {
        await connection.query('BEGIN');
        const result = await operations(connection);
        await connection.query('COMMIT');
        return result;
      } catch (err) {
        await connection.query('ROLLBACK');
        throw err;
      } finally {
        connection.release();
      }
    }

    function serialize(builder, bindVariables) {
      return builder.generate({ dialect: 'pg', prettyPrint: true, paramType: sqb.ParamType.DOLLAR, }, bindVariables);
    }

    function buildWhereClause(column, values, bindVariables, listBuilder, countBuilder) {
      const clauseVariables = [].concat(values).reduce((clauseVariables, value, index) => {
        return Object.assign(clauseVariables, { [uuid()]: value, });
      }, {});

      const placeholders = Object.keys(clauseVariables).map(key => new RegExp(key));

      listBuilder.where(Op.in(column, placeholders));
      countBuilder.where(Op.in(column, placeholders));

      Object.assign(bindVariables, clauseVariables);
    }

    cb(null, {
      query,
      withTransaction,
      serialize,
      buildWhereClause,
    });
  }

  return {
    start,
  };
}
