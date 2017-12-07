const marv = require('marv');
const pgDriver = require('marv-pg-driver');
const path = require('path');
const async = require('async');

module.exports = function(options) {

  function start({ config, }, cb) {
    async.eachSeries(['migrations', 'refdata',], (namespace, cb) => {
      const directory = path.join(__dirname, namespace );
      const driver = pgDriver({ connection: config, });
      marv.scan(directory, (err, migrations) => {
        if (err) return cb(err);
        marv.migrate(migrations, driver, cb);
      });
    }, cb);
  }

  return {
    start: start,
  };
};
