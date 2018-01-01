export default function(options = {}) {

  function start({ namespace, account, release, deployment, tables, }, cb) {

    async function nuke() {
      Object.keys(tables).forEach(name => {
        tables[name].length = 0;
      });
      tables.accounts.push({ id: '00000000-0000-0000-0000-000000000000', displayName: 'root', createdOn: new Date(), createdBy: null, });
      tables.namespaces.push({ id: '00000000-0000-0000-0000-000000000000', name: 'default', createdOn: new Date(), createdBy: '00000000-0000-0000-0000-000000000000', });
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
