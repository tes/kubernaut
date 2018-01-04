import { v4 as uuid, } from 'uuid';

export default function(options) {

  function start({ tables, }, cb) {

    const { namespaces, } = tables;

    async function getNamespace(id) {
      return namespaces.find(n => n.id === id && !n.deletedOn);
    }

    async function findNamespace({ name, }) {
      const namespace = namespaces.find(n => n.name === name && !n.deletedOn);
      if (!namespace) return;
      return { ...namespace, };
    }

    async function saveNamespace(namespace, meta) {
      reportMissingMetadata(meta);
      reportDuplicateNamespaces(namespace);

      return append(namespaces, {
        ...namespace, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      });
    }

    async function listNamespaces(limit = 50, offset = 0) {
      const active = namespaces.filter(byActive).sort(byName);
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
      if (namespaces.find(n => n.name === namespace.name && !n.deletedOn)) throw Object.assign(new Error('Duplicate Namespace'), { code: '23505', });
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveNamespace,
      getNamespace,
      findNamespace,
      listNamespaces,
      deleteNamespace,
    });
  }

  return {
    start,
  };
}
