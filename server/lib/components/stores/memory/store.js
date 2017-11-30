export default function(options = {}) {

  function start({ account, release, deployment, tables, }, cb) {

    async function nuke() {
      Object.keys(tables).forEach(name => {
        tables[name].length = 0;
      });
    }

    cb(null, {
      ...account,
      ...release,
      ...deployment,
      nuke,
    });
  }

  return {
    start,
  };
}
