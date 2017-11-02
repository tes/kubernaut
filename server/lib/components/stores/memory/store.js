export default function(options = {}) {

  function start({ release, deployment, tables, }, cb) {

    async function nuke() {
      Object.keys(tables).forEach(name => {
        tables[name].length = 0;
      });
    }

    cb(null, {
      ...release,
      ...deployment,
      nuke,
    });
  }

  return {
    start,
  };
}
