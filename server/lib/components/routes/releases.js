import bodyParser from 'body-parser';
import hogan from 'hogan.js';
import Debug from 'debug';
const debug = Debug('kubernaut:routes:api');

export default function(options = {}) {

  function start({ pkg, app, prepper, kubernetes, }, cb) {

    app.post('/api/releases', bodyParser.json(), async (req, res, next) => {

      const { image, template, } = req.body;

      try {
        const yaml = hogan.compile(template).render({ image, });
        await kubernetes.apply(yaml, res.locals.logger);
        res.json({});
      } catch(err) {
        next(err);
      }
    });

    cb();
  }


  return {
    start,
  };
}
