import { v4 as uuid, } from 'uuid';
import Service from '../../../domain/Service';
import Release from '../../../domain/Release';


export default function(options = {}) {

  function start({ tables, registries, }, cb) {

    const { services, releases, } = tables;

    async function saveRelease(release, meta) {
      reportMissingMetadata(meta);

      const service = await ensureService(release.service, meta);

      reportDuplicateReleaseVersions(release);

      return append(releases, new Release({
        ...release, id: uuid(), service, createdOn: meta.date, createdBy: meta.account,
      }));
    }

    async function findService(name) {
      return services.find(s => s.name === name && !s.deletedOn);
    }

    async function ensureService(data, meta) {
      reportMissingMetadata(meta);

      const registry = await registries.findRegistry({ name: data.registry.name, });
      if (!registry) throw Object.assign(new Error('Missing registry'), { code: '23502', });

      return await findService(data.name) || append(services, new Service({
        id: uuid(), name: data.name, registry, createdOn: meta.date, createdBy: meta.account,
      }));
    }

    async function getRelease(id) {
      return releases.find(r =>
        r.id === id &&
        !r.deletedOn &&
        !r.service.deletedOn &&
        !r.service.registry.deletedOn);
    }

    async function findRelease({ name, registry, version, }) {
      return releases.find(r =>
        r.service.name === name &&
        r.service.registry.name === registry &&
        r.version === version &&
        !r.deletedOn &&
        !r.service.deletedOn &&
        !r.service.registry.deletedOn
      );
    }

    async function findReleases(criteria = {}, limit = 50, offset = 0) {

      let active = releases.filter(byActive).map(toSlimRelease).sort(byMostRecent);

      if (criteria.hasOwnProperty('service')) {
        active = active.filter(r => criteria.service === r.service.name);
      }

      if (criteria.hasOwnProperty('registry')) {
        active = active.filter(r => criteria.registry === r.service.registry.name);
      }

      if (criteria.hasOwnProperty('registries')) {
        active = active.filter(r => criteria.registries.includes(r.service.registry.id));
      }

      const count = active.length;
      const items = active.slice(offset, offset + limit);
      return { limit, offset, count, items, };
    }

    async function deleteRelease(id, meta) {
      reportMissingMetadata(meta);
      const release = await getRelease(id);
      if (release) {
        release.deletedOn = meta.date;
        release.deletedBy = meta.account;
      }
    }

    function reportDuplicateReleaseVersions(release) {
      if (releases.find(r =>
        r.service.name === release.service.name &&
        r.service.registry.name === release.service.registry.name &&
        r.version === release.version &&
        !r.deletedOn)
      ) throw Object.assign(new Error('Duplicate Release'), { code: '23505', });
    }

    function reportMissingMetadata(meta) {
      if (!meta.date || !meta.account) throw Object.assign(new Error('Missing Metadata'), { code: '23502', });
    }

    function byMostRecent(a, b) {
      return getTimeForSort(b.deletedOn) - getTimeForSort(a.deletedOn) ||
             getTimeForSort(b.createdOn) - getTimeForSort(a.createdOn) ||
             b.id.localeCompare(a.id);
    }

    function byActive(r) {
      return !r.deletedOn &&
             !r.service.deletedOn &&
             !r.service.registry.deletedOn;
    }

    function getTimeForSort(date) {
      return date ? date.getTime() : 0;
    }

    function toSlimRelease(release) {
      return { ...release, template: undefined, attributes: {}, };
    }

    function append(collection, item) {
      collection.push(item);
      return item;
    }

    return cb(null, {
      saveRelease,
      getRelease,
      findRelease,
      findReleases,
      deleteRelease,
    });
  }

  return {
    start,
  };
}
