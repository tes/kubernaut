import { v4 as uuid, } from 'uuid';

export default function(options = {}) {
  function start({ tables, }, cb) {

    const { deployments, } = tables;

    async function saveDeployment(release, {context,}, meta) {
      const deployment = {
        id: uuid(), release: release.id, context, createdOn: meta.date, createdBy: meta.user,
      };
      deployments.push(deployment);
      return deployment;
    }

    return cb(null, {
      saveDeployment,
    });
  }

  return {
    start,
  };
}
