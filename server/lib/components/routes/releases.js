import bodyParser from 'body-parser';

export default function(options = {}) {

  function start({ pkg, app, prepper, kubernetes, }, cb) {

    app.post('/api/releases', bodyParser.json(), (req, res, next) => {
      kubernetes.apply(req.body.image, req.body.manifest, (err) => {
        if (err) return next(err);
        res.json({});
      });
    });

    cb();
  }

  return {
    start,
  };
}
