import eachSeries from 'async/mapSeries';

export default function() {

  let strategies;

  function start(dependencies, cb) {

    const { config, app, passport, session, } = dependencies;

    app.use(session);
    app.use(passport.initialize());
    app.use(passport.session());

    strategies = [];

    eachSeries(config, (strategyConfig, cb) => {
      const strategy = require(`./strategy-${strategyConfig.id}`)();
      strategy.start({ ...dependencies, config: strategyConfig, }, err => {
        if (err) return cb(err);
        strategies.push(strategy);
        cb();
      });
    }, cb);
  }

  function stop(cb) {
    eachSeries(strategies, (strategy, cb) => {
      return strategy.stop ? strategy.stop(cb) : cb();
    }, cb);
  }

  return {
    start,
    stop,
  };
}
