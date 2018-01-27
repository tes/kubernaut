import { v4 as uuid, } from 'uuid';
import Namespace from '../../../domain/Namespace';

export default function(options) {

  function start({ tables, }, cb) {

    const { namespaces, } = tables;

    async function getNamespace(id) {
      return namespaces.find(n => n.id === id && !n.deletedOn);
    }

    async function findNamespace({ name, cluster, }) {
      return namespaces.find(n => n.name === name && n.cluster.name === cluster && !n.deletedOn);
    }

    async function saveNamespace(namespace, meta) {
      reportMissingMetadata(meta);
      reportDuplicateNamespaces(namespace);

      return append(namespaces, new Namespace({
        ...namespace, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      }));
    }

    async function findNamespaces(criteria = {}, limit = 50, offset = 0) {

      let active = namespaces.filter(byActive).sort(byName);

      if (criteria.hasOwnProperty('ids')) {
        active = active.filter(n => criteria.ids.includes(n.id));
      }

      if (criteria.hasOwnProperty('name')) {
        active = active.filter(n => criteria.name === n.name);
      }

      if (criteria.hasOwnProperty('cluster')) {
        active = active.filter(n => criteria.cluster === n.cluster.name);
      }

      const count = active.length;
      const items = active.slice(offset, offset + limit);
      return { limit, offset, count, items, };
    }

    async function deleteNamespace(id, meta) {
      reportMissingMetadata(meta);
      const namespace = namespaces.find(n => n.id === id && !n.deletedOn);
      if (namespace) {
        namespace.deletedOn = meta.date;
        namespace.deletedBy = meta.account;
      }
    }

    function byActive(n) {
      return !n.deletedOn;
    }

    function byName(a, b) {
      return a.name.localeCompare(b.name);
    }

    function reportMissingMetadata(meta) {
      if (!meta.date || !meta.account) throw Object.assign(new Error('Missing Metadata'), { code: '23502', });
    }

    function reportDuplicateNamespaces(namespace) {
      if (namespaces.find(n =>
        n.name === namespace.name &&
        n.cluster.name === namespace.cluster.name &&
        !n.deletedOn
      )) throw Object.assign(new Error('Duplicate namespace'), { code: '23505', });
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveNamespace,
      getNamespace,
      findNamespace,
      findNamespaces,
      deleteNamespace,
    });
  }

  return {
    start,
  };
}
