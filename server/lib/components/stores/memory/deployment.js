import { v4 as uuid, } from 'uuid';

export default function(options = {}) {
  function start({ tables, }, cb) {

    const { deployments, } = tables;

    async function saveDeployment(deployment, meta) {
      return append(deployments, {
        ...deployment, id: uuid(), createdOn: meta.date, createdBy: meta.user,
      });
    }

    async function getDeployment(id) {
      return deployments.find(d => d.id === id);
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveDeployment,
      getDeployment,
    });
  }

  return {
    start,
  };
}
