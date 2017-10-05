import pick from 'lodash.pick';
import onHeaders from 'on-headers';
import prepper from 'prepper';

const handlers = prepper.handlers;

export default function(options = {}) {

  function start({ app, }, cb) {
    app.use((req, res, next) => {

      const requestLogger = req.app.locals.logger.child({ handlers: [
        new handlers.Tracer(),
        new handlers.Merge(pick(req, ['url', 'method', 'headers', 'params',]), { key: 'request', }),
      ],});

      onHeaders(res, () => {
        if (res.locals.suppressPrepperMiddleware) return;
        const response = { response: { statusCode: res.statusCode, headers: res.headers, }, };
        if (res.statusCode === 400) requestLogger.error(req.url, response);
        if (res.statusCode < 500) requestLogger.info(req.url, response);
        else requestLogger.error(req.url, response);
      });

      res.locals.logger = requestLogger;

      next();
    });

    cb(null, { enable, disable, });
  }

  function enable(req, res, next) {
    res.locals.suppressPrepperMiddleware = false;
    next();
  }

  function disable(req, res, next) {
    res.locals.suppressPrepperMiddleware = true;
    next();
  }

  return {
    start,
  };
}
