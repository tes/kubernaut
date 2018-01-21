export default function(options = {}) {

  function start({ accounts, registries, releases, clusters, namespaces, deployments, tables, }, cb) {

    async function nuke() {
      Object.keys(tables).forEach(name => {
        tables[name].length = 0;
      });
      tables.accounts.push({ id: '00000000-0000-0000-0000-000000000000', displayName: 'root', createdOn: new Date(), createdBy: '00000000-0000-0000-0000-000000000000', });
      tables.registries.push({ id: '00000000-0000-0000-0000-000000000000', name: 'default', createdOn: new Date(), createdBy: '00000000-0000-0000-0000-000000000000', });
      tables.namespaces.push({ id: '00000000-0000-0000-0000-000000000000', name: 'default', createdOn: new Date(), createdBy: '00000000-0000-0000-0000-000000000000', });
    }

    cb(null, {
      ...accounts,
      ...registries,
      ...releases,
      ...clusters,
      ...namespaces,
      ...deployments,
      nuke,
    });
  }

  return {
    start,
  };
}
