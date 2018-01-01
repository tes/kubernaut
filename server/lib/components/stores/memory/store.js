export default function(options = {}) {

  function start({ namespace, account, release, deployment, tables, }, cb) {

    async function nuke() {
      Object.keys(tables).forEach(name => {
        tables[name].length = 0;
      });
      tables.accounts.push({ id: 'root', displayName: 'root', createdOn: new Date(), createdBy: null, });
      tables.namespaces.push({ id: 'default', name: 'default', createdOn: new Date(), createdBy: 'root', });
    }

    cb(null, {
      ...namespace,
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
