import multer from 'multer';
import hogan from 'hogan.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, });

export default function(options = {}) {

  function start({ pkg, app, prepper, kubernetes, }, cb) {

    app.post('/api/releases', upload.single('TEMPLATE'), async (req, res, next) => {

      const template = new Buffer(req.file.buffer).toString();
      try {
        const yaml = hogan.compile(template).render(req.body);
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
