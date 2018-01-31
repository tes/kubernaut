import { v4 as uuid, } from 'uuid';
import Deployment from '../../../domain/Deployment';
import DeploymentLogEntry from '../../../domain/DeploymentLogEntry';


export default function(options = {}) {
  function start({ tables, releases, }, cb) {

    const { namespaces, deployments, deploymentLogEntries, } = tables;
    let deploymentLogSequence = 0;

    function _getDeployment(id) {
      return deployments.find(d =>
        d.id === id &&
        !d.deletedOn &&
        namespaces.find(n => n.id === d.namespace.id && !n.deletedOn) &&
        !d.release.deletedOn &&
        !d.release.service.deletedOn);
    }

    function _listDeploymentLogEntries(id) {
      return deploymentLogEntries.filter(e =>
        e.deployment.id === id
      ).sort(byLeastRecent);
    }

    async function getDeployment(id) {
      const deployment = _getDeployment(id);
      const log = _listDeploymentLogEntries(id);
      return deployment ? new Deployment({ ...deployment, log, }) : undefined;
    }

    async function saveDeployment(deployment, meta) {
      reportMissingMetadata(meta);

      const release = await releases.getRelease(deployment.release.id);
      if (!release) throw Object.assign(new Error('Missing Release'), { code: '23502', });

      return append(deployments, new Deployment({
        ...deployment, release, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      }));
    }

    async function saveApplyExitCode(id, code) {
      const deployment = _getDeployment(id);
      if (!deployment || deployment.applyExitCode !== undefined) throw new Error(`Deployment ${id} was not updated`);
      deployment.applyExitCode = code;
    }

    async function saveRolloutStatusExitCode(id, code) {
      const deployment = _getDeployment(id);
      if (!deployment || deployment.rolloutStatusExitCode !== undefined) throw new Error(`Deployment ${id} was not updated`);
      deployment.rolloutStatusExitCode = code;
    }

    async function saveDeploymentLogEntry(logEntry) {
      return append(deploymentLogEntries, new DeploymentLogEntry({
        ...logEntry, id: uuid(), sequence: deploymentLogSequence++,
      }));
    }

    async function findDeployments(criteria = {}, limit = 50, offset = 0) {
      let active = deployments.filter(byActive).sort(byMostRecent).map(toSlimDeployment);

      if (criteria.hasOwnProperty('service')) {
        active = active.filter(d => criteria.service === d.release.service.name);
      }

      if (criteria.hasOwnProperty('namespace')) {
        active = active.filter(d => criteria.namespace === d.namespace.name);
      }

      if (criteria.hasOwnProperty('cluster')) {
        active = active.filter(d => criteria.cluster === d.namespace.cluster.name);
      }

      if (criteria.hasOwnProperty('namespaces')) {
        active = active.filter(d => criteria.namespaces.includes(d.namespace.id));
      }

      const count = active.length;
      const items = active.slice(offset, offset + limit);
      return { limit, offset, count, items, };
    }

    async function deleteDeployment(id, meta) {
      reportMissingMetadata(meta);

      const deployment = _getDeployment(id);
      if (deployment) {
        deployment.deletedOn = meta.date;
        deployment.deletedBy = meta.account;
      }
    }


    function reportMissingMetadata(meta) {
      if (!meta.date || !meta.account) throw Object.assign(new Error('Missing Metadata'), { code: '23502', });
    }

    function byActive(d) {
      const n = namespaces.find(n => n.id === d.namespace.id);
      return !d.deletedOn &&
             !n.deletedOn &&
             !d.release.deletedOn &&
             !d.release.service.deletedOn;
    }

    function getTimeForSort(date) {
      return date ? date.getTime() : 0;
    }

    function byMostRecent(a, b) {
      return getTimeForSort(b.deletedOn) - getTimeForSort(a.deletedOn) ||
             getTimeForSort(b.createdOn) - getTimeForSort(a.createdOn) ||
             b.id.localeCompare(a.id);
    }

    function byLeastRecent(a, b) {
      return getTimeForSort(a.writtenOn) - getTimeForSort(b.writtenOn) ||
             a.sequence - b.sequence;
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
      saveApplyExitCode,
      saveRolloutStatusExitCode,
      saveDeploymentLogEntry,
      getDeployment,
      findDeployments,
      deleteDeployment,
    });
  }

  return {
    start,
  };
}
