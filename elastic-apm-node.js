module.exports = {
  appName: 'kubernaut',
  appVersion: process.env.APP_VERSION || 'unknown',

  serverUrl: 'http://apm-server.logging:8200',

  ignoreUrls: [
    '/status',
    /^\/__\//i,
  ],

  flushInterval: 15,
  maxQueueSize: 1024,
};
