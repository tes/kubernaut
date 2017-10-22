import { v4 as uuid, } from 'uuid';

export default function(options = {}) {

  function start({ tables, }, cb) {

    const { profiles, } = tables;

    async function saveProfile(profile, meta) {
      reportDuplicateProfileVersions(profile);
      return append(profiles, {
        ...profile, id: uuid(), createdOn: meta.date, createdBy: meta.user,
      });
    }

    function reportDuplicateProfileVersions(profile) {
      if (profiles.find(r => r.name === profile.name && r.version === profile.version)) throw Object.assign(new Error(), { code: '23505', });
    }

    function append(table, item) {
      table.push(item);
      return item;
    }

    return cb(null, {
      saveProfile,
    });
  }

  return {
    start,
  };
}
