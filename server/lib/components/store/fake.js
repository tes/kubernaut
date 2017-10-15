export default function(options = {}) {

  function start({ releases = [], clock, }, cb) {

    async function getRelease(id) {
      return releases.find(r => r.id === id && !r.deletedOn);
    }

    async function saveRelease(release, meta) {
      duplicateIdCheck(release);
      duplicateVersionCheck(release);
      releases.push({ ...release, createdOn: meta.date, createdBy: meta.user, });
    }

    async function listReleases(limit = 50, offset = 0) {
      return releases.filter(r => !r.deletedOn).map(toSlimRelease).sort(byMostRecent).slice(offset, offset + limit);
    }

    async function deleteRelease(id, meta) {
      const release = releases.find(r => r.id === id && !r.deletedOn);
      if (release) {
        release.deletedOn = meta.date;
        release.deletedBy = meta.user;
      }
    }

    function duplicateIdCheck(release) {
      if (releases.find(r => release.id === r.id)) throw Object.assign(new Error(), { code: '23505', });
    }

    function duplicateVersionCheck(release) {
      if (releases.find(r => release.name === r.name && release.version === r.version)) throw Object.assign(new Error(), { code: '23505', });
    }

    function byMostRecent(a, b) {
      return getTimeForSort(b.deletedOn) - getTimeForSort(a.deletedOn) ||
             getTimeForSort(b.createdOn) - getTimeForSort(a.createdOn) ||
             b.id.localeCompare(a.id);
    }

    function getTimeForSort(date) {
      return date ? date.getTime() : 0;
    }

    function toSlimRelease(release) {
      return { ...release, template: undefined, attributes: {}, };
    }

    async function nuke() {
      releases.length = 0;
    }

    return cb(null, {
      getRelease,
      saveRelease,
      listReleases,
      deleteRelease,
      nuke,
    });
  }

  return {
    start,
  };
}
