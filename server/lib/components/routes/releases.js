import multer from 'multer';
import hogan from 'hogan.js';
import { v4 as uuid, } from 'uuid';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, });

export default function(options = {}) {

  function start({ pkg, app, prepper, store, kubernetes, }, cb) {

    app.get('/api/releases', async (req, res, next) => {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
      try {
        const releases = await store.listReleases(limit, offset);
        res.json(releases);
      } catch (err) {
        next(err);
      }
    });

    app.get('/api/releases/:id', async (req, res, next) => {
      try {
        const release = await store.getRelease(req.params.id);
        return release ? res.json(release) : next();
      } catch (err) {
        next(err);
      }
    });

    app.post('/api/releases', upload.single('template'), async (req, res, next) => {

      const template = new Buffer(req.file.buffer).toString();
      const yaml = hogan.compile(template).render(req.body);
      const release = {
        id: uuid(),
        name: req.body.name,
        version: req.body.version,
        description: req.body.description,
        template,
        attributes: req.body,
      };

      try {
        await store.saveRelease(release, { date: new Date(), user: 'anonymous', });
        await kubernetes.apply(yaml, res.locals.logger);
        res.json({ id: release.id, });
      } catch(err) {
        next(err);
      }
    });

    app.delete('/api/releases/:id', async (req, res, next) => {
      try {
        await store.deleteRelease(req.params.id, { date: new Date(), user: 'anonymous', });
        res.send(202);
      } catch (err) {
        next(err);
      }
    });

    cb();
  }


  return {
    start,
  };
}
