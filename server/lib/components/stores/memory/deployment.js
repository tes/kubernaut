import { v4 as uuid, } from 'uuid';

export default function(options = {}) {
  function start({ tables, }, cb) {

    const { deployments, } = tables;

    async function getDeployment(id) {
      return deployments.find(d => d.id === id);
    }

    async function saveDeployment(deployment, meta) {
      return append(deployments, {
        ...deployment, id: uuid(), createdOn: meta.date, createdBy: meta.user,
      });
    }

    async function deleteDeployment(id, meta) {
      const deployment = deployments.find(r => r.id === id && !r.deletedOn);
      if (deployment) {
        deployment.deletedOn = meta.date;
        deployment.deletedBy = meta.user;
      }
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveDeployment,
      getDeployment,
      deleteDeployment,
    });
  }

  return {
    start,
  };
}
