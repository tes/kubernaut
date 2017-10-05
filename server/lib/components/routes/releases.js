import bodyParser from 'body-parser';
import { safeLoadAll } from 'js-yaml';
import hogan from 'hogan.js';

export default function(options = {}) {

  function start({ pkg, app, prepper, kubernetes, }, cb) {

    app.post('/api/releases', bodyParser.json(), async (req, res, next) => {

      const { image, template } = req.body;

      try {
        const yaml = hogan.compile(template).render({ image });
        const manifest = safeLoadAll(yaml)
        await kubernetes.apply(image, manifest)
        res.json({})
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
