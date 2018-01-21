import { v4 as uuid, } from 'uuid';
import Cluster from '../../../domain/Cluster';

export default function(options) {

  function start({ tables, }, cb) {

    const { clusters, } = tables;

    async function getCluster(id) {
      return clusters.find(c => c.id === id && !c.deletedOn);
    }

    async function findCluster({ name, }) {
      return clusters.find(c => c.name === name && !c.deletedOn);
    }

    async function saveCluster(cluster, meta) {
      reportMissingMetadata(meta);
      reportDuplicateClusters(cluster);

      return append(clusters, new Cluster({
        ...cluster, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      }));
    }

    async function listClusters(limit = 50, offset = 0) {
      const active = clusters.filter(byActive).sort(byName);
      const count = active.length;
      const items = active.slice(offset, offset + limit);
      return { limit, offset, count, items, };
    }

    async function deleteCluster(id, meta) {
      reportMissingMetadata(meta);
      const cluster = clusters.find(c => c.id === id && !c.deletedOn);
      if (cluster) {
        cluster.deletedOn = meta.date;
        cluster.deletedBy = meta.account;
      }
    }

    function byActive(c) {
      return !c.deletedOn;
    }

    function byName(a, b) {
      return a.name.localeCompare(b.name);
    }

    function reportMissingMetadata(meta) {
      if (!meta.date || !meta.account) throw Object.assign(new Error('Missing Metadata'), { code: '23502', });
    }

    function reportDuplicateClusters(cluster) {
      if (clusters.find(c => (c.name === cluster.name || c.context === cluster.context) && !c.deletedOn)) throw Object.assign(new Error('Duplicate cluster'), { code: '23505', });
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveCluster,
      getCluster,
      findCluster,
      listClusters,
      deleteCluster,
    });
  }

  return {
    start,
  };
}
