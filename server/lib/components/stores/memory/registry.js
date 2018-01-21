import { v4 as uuid, } from 'uuid';
import Registry from '../../../domain/Registry';

export default function(options) {

  function start({ tables, }, cb) {

    const { registries, } = tables;

    async function getRegistry(id) {
      return registries.find(n => n.id === id && !n.deletedOn);
    }

    async function findRegistry({ name, }) {
      return registries.find(n => n.name === name && !n.deletedOn);
    }

    async function saveRegistry(registry, meta) {
      reportMissingMetadata(meta);
      reportDuplicateRegistries(registry);

      return append(registries, new Registry({
        ...registry, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      }));
    }

    async function listRegistries(limit = 50, offset = 0) {
      const active = registries.filter(byActive).sort(byName);
      const count = active.length;
      const items = active.slice(offset, offset + limit);
      return { limit, offset, count, items, };
    }

    async function deleteRegistry(id, meta) {
      reportMissingMetadata(meta);
      const registry = registries.find(n => n.id === id && !n.deletedOn);
      if (registry) {
        registry.deletedOn = meta.date;
        registry.deletedBy = meta.account;
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

    function reportDuplicateRegistries(registry) {
      if (registries.find(n => n.name === registry.name && !n.deletedOn)) throw Object.assign(new Error('Duplicate registry'), { code: '23505', });
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveRegistry,
      getRegistry,
      findRegistry,
      listRegistries,
      deleteRegistry,
    });
  }

  return {
    start,
  };
}
