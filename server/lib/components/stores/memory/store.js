export default function(options = {}) {

  function start({ release, tables, }, cb) {

    async function nuke() {
      Object.keys(tables).forEach(name => {
        tables[name].length = 0;
      });
    }

    cb(null, {
      ...release,
      nuke,
    });
  }

  return {
    start,
  };
}
