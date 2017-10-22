import { v4 as uuid, } from 'uuid';

export default function(options = {}) {

  function start({ tables, }, cb) {

    const { profiles, } = tables;

    async function getProfile(id) {
      const profile = profiles.find(r => r.id === id && !r.deletedOn);
      if (!profile) return;
      return { ...profile, };
    }

    async function saveProfile(profile, meta) {
      reportDuplicateProfileVersions(profile);
      return append(profiles, {
        ...profile, id: uuid(), createdOn: meta.date, createdBy: meta.user,
      });
    }

    async function listProfiles(limit = 50, offset = 0) {
      return profiles.filter(byActive)
        .map(toSlimProfile)
        .sort(byMostRecent)
        .slice(offset, offset + limit);
    }

    async function deleteProfile(id, meta) {
      const profile = profiles.find(r => r.id === id && !r.deletedOn);
      if (profile) {
        profile.deletedOn = meta.date;
        profile.deletedBy = meta.user;
      }
    }

    function reportDuplicateProfileVersions(profile) {
      if (profiles.find(r => r.name === profile.name && r.version === profile.version)) throw Object.assign(new Error(), { code: '23505', });
    }

    function byActive(r) {
      return !r.deletedOn;
    }

    function byMostRecent(a, b) {
      return getTimeForSort(b.deletedOn) - getTimeForSort(a.deletedOn) ||
             getTimeForSort(b.createdOn) - getTimeForSort(a.createdOn) ||
             b.id.localeCompare(a.id);
    }

    function getTimeForSort(date) {
      return date ? date.getTime() : 0;
    }

    function toSlimProfile(profile) {
      return { ...profile, attributes: {}, };
    }

    function append(table, item) {
      table.push(item);
      return item;
    }

    return cb(null, {
      getProfile,
      saveProfile,
      listProfiles,
      deleteProfile,
    });
  }

  return {
    start,
  };
}
