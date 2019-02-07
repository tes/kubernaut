import sqb from 'sqb';
const { Op, raw, innerJoin } = sqb;


export default function(options) {

  function start({ config, logger, db }, cb)  {

    return cb(null, {

    });
  }

  return {
    start,
  };
}
