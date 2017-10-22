export default function(options = {}) {

  function start({ profile, release, tables, }, cb) {

    async function nuke() {
      Object.keys(tables).forEach(name => {
        tables[name].length = 0;
      });
    }

    cb(null, {
      ...profile,
      ...release,
      nuke,
    });
  }

  return {
    start,
  };
}
