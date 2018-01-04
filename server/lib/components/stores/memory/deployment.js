import { v4 as uuid, } from 'uuid';

export default function(options = {}) {
  function start({ tables, }, cb) {

    const { deployments, releases, } = tables;

    async function getDeployment(id) {
      return deployments.find(d => d.id === id && !d.deletedOn);
    }

    async function saveDeployment(deployment, meta) {
      reportMissingMetadata(meta);
      reportMissingRelease(deployment.release);
      const release = releases.find(r => r.id === deployment.release.id);

      return append(deployments, {
        ...deployment, release, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      });
    }

    async function deleteDeployment(id, meta) {
      reportMissingMetadata(meta);
      const deployment = deployments.find(r => r.id === id && !r.deletedOn);
      if (deployment) {
        deployment.deletedOn = meta.date;
        deployment.deletedBy = meta.account;
      }
    }

    async function listDeployments(limit = 50, offset = 0) {
      const active = deployments.filter(byActive).sort(byMostRecent).map(toSlimDeployment);
      const count = active.length;
      const items = active.slice(offset, offset + limit);
      return { limit, offset, count, items, };
    }

    function reportMissingRelease(release) {
      if (!releases.find(r => r.id === release.id && !r.deletedOn)) throw Object.assign(new Error('Missing Release'), { code: '23502', });
    }

    function reportMissingMetadata(meta) {
      if (!meta.date || !meta.account) throw Object.assign(new Error('Missing Metadata'), { code: '23502', });
    }

    function byActive(d) {
      return !d.deletedOn &&
             !d.release.deletedOn &&
             !d.release.service.deletedOn &&
             !d.release.service.namespace.deletedOn;
    }

    function getTimeForSort(date) {
      return date ? date.getTime() : 0;
    }

    function byMostRecent(a, b) {
      return getTimeForSort(b.deletedOn) - getTimeForSort(a.deletedOn) ||
             getTimeForSort(b.createdOn) - getTimeForSort(a.createdOn) ||
             b.id.localeCompare(a.id);
    }

    function toSlimDeployment(deployment) {
      const release = { ...deployment.release, template: undefined, attribtes: {}, };
      return { ...deployment, release, };
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveDeployment,
      getDeployment,
      listDeployments,
      deleteDeployment,
    });
  }

  return {
    start,
  };
}
