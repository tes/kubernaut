import { v4 as uuid, } from 'uuid';

export default function(options = {}) {

  function start({ tables, }, cb) {

    const { namespaces, services, releases, } = tables;

    async function getService(id) {
      return services.find(s => s.id === id && !s.deletedOn);
    }

    async function getRelease(id) {
      const release = releases.find(r => r.id === id && !r.deletedOn);
      if (!release) return;

      const service = services.find(s => s.id === release.service.id);
      return { ...release, service, };
    }

    async function findRelease({ name, namespace, version, }) {
      const release = releases.find(r =>
        r.service.name === name &&
        r.service.namespace.name === namespace &&
        r.version === version &&
        !r.deletedOn
      );
      if (!release) return;

      const service = services.find(s => s.id === release.service.id);
      return { ...release, service, };
    }

    async function saveRelease(release, meta) {
      reportMissingMetadata(meta);

      const service = await ensureService(release.service, release.service.namespace.name, meta);

      reportDuplicateReleaseVersions(release);

      return append(releases, {
        ...release, id: uuid(), service, createdOn: meta.date, createdBy: meta.account,
      });
    }

    async function ensureService(data, namespaceName, meta) {
      reportMissingMetadata(meta);
      reportMissingNamespace(namespaceName);

      const namespace = namespaces.find(n => n.name === namespaceName && !n.deletedOn);

      return services.find(s => s.name === data.name && s.namespace.name === namespace.name) || append(services, {
        id: uuid(), name: data.name, namespace, createdOn: meta.date, createdBy: meta.account,
      });
    }

    async function listReleases(limit = 50, offset = 0) {
      return releases.filter(byActive)
        .map(toSlimRelease)
        .sort(byMostRecent)
        .slice(offset, offset + limit);
    }

    async function deleteRelease(id, meta) {
      reportMissingMetadata(meta);
      const release = releases.find(r => r.id === id && !r.deletedOn);
      if (release) {
        release.deletedOn = meta.date;
        release.deletedBy = meta.account;
      }
    }

    function reportDuplicateReleaseVersions(release) {
      if (releases.find(r =>
        r.service.name === release.service.name &&
        r.service.namespace.name === release.service.namespace.name &&
        r.version === release.version &&
        !r.deletedOn)
      ) throw Object.assign(new Error('Duplicate Release'), { code: '23505', });
    }

    function reportMissingNamespace(name) {
      if (!namespaces.find(n => n.name === name && !n.deletedOn)) throw Object.assign(new Error('Missing namespace'), { code: '23502', });
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
      return !r.deletedOn && !getService(r.service).deletedOn;
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
      getRelease,
      findRelease,
      saveRelease,
      listReleases,
      deleteRelease,
    });
  }

  return {
    start,
  };
}
