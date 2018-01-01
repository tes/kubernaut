import SQL from './sql';

export default function(options) {

  function start({ config, logger, postgres: db, }, cb) {

    async function getNamespace(id) {
    }

    async function findNamespace({ name, }) {
    }

    async function saveNamespace(data, meta) {
    }

    async function listNamespaces(limit = 50, offset = 0) {
    }

    async function deleteNamespace(id, meta) {
    }

    return cb(null, {
    });
  }

  return {
    start,
  };
}
