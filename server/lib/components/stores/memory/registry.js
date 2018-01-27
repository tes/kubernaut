import { v4 as uuid, } from 'uuid';
import Registry from '../../../domain/Registry';

export default function(options) {

  function start({ tables, }, cb) {

    const { registries, } = tables;

    async function getRegistry(id) {
      return registries.find(r => r.id === id && !r.deletedOn);
    }

    async function findRegistry({ name, }) {
      return registries.find(r => r.name === name && !r.deletedOn);
    }

    async function saveRegistry(registry, meta) {
      reportMissingMetadata(meta);
      reportDuplicateRegistries(registry);

      return append(registries, new Registry({
        ...registry, id: uuid(), createdOn: meta.date, createdBy: meta.account,
      }));
    }

    async function findRegistries(criteria = {}, limit = 50, offset = 0) {

      let active = registries.filter(byActive).sort(byName);

      if (criteria.hasOwnProperty('ids')) {
        active = active.filter(r => criteria.ids.includes(r.id));
      }

      if (criteria.hasOwnProperty('name')) {
        active = active.filter(r => criteria.name === r.name);
      }

      const count = active.length;
      const items = active.slice(offset, offset + limit);
      return { limit, offset, count, items, };
    }

    async function deleteRegistry(id, meta) {
      reportMissingMetadata(meta);
      const registry = registries.find(r => r.id === id && !r.deletedOn);
      if (registry) {
        registry.deletedOn = meta.date;
        registry.deletedBy = meta.account;
      }
    }

    function byActive(r) {
      return !r.deletedOn;
    }

    function byName(a, b) {
      return a.name.localeCompare(b.name);
    }

    function reportMissingMetadata(meta) {
      if (!meta.date || !meta.account) throw Object.assign(new Error('Missing Metadata'), { code: '23502', });
    }

    function reportDuplicateRegistries(registry) {
      if (registries.find(r => r.name === registry.name && !r.deletedOn)) throw Object.assign(new Error('Duplicate registry'), { code: '23505', });
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveRegistry,
      getRegistry,
      findRegistry,
      findRegistries,
      deleteRegistry,
    });
  }

  return {
    start,
  };
}
