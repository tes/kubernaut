import eachSeries from 'async/mapSeries';

export default function() {

  let components = [];

  function start(dependencies, cb) {

    const { config, app, passport, session, } = dependencies;

    app.use(session);
    app.use(passport.initialize());
    app.use(passport.session());

    components = [];

    eachSeries(config, (strategyConfig, cb) => {
      const component = require(`./strategy-${strategyConfig.id}`)();
      component.start({ ...dependencies, config: strategyConfig, }, (err, strategy) => {
        if (err) return cb(err);
        components.push(component);
        cb(null, strategy.name);
      });
    }, (err, strategies) => {
      if (err) return cb(err);
      app.use(passport.authenticate(strategies));
      cb();
    });
  }

  function stop(cb) {
    eachSeries(components, (component, cb) => {
      return component.stop ? component.stop(cb) : cb();
    }, cb);
  }

  return {
    start,
    stop,
  };
}
