module.exports = {
  logger: {
    transport: 'bunyan',
    include: [
      'tracer',
      'timestamp',
      'level',
      'message',
      'error.message',
      'error.code',
      'error.stack',
      'request.url',
      'request.headers',
      'request.params',
      'request.method',
      'response.statusCode',
      'response.headers',
      'response.time',
      'process',
      'system',
      'package.name',
      'app',
    ],
    exclude: [
      'password',
      'secret',
      'token',
      'request.headers.authorization',
      'request.headers.cookie',
      'dependencies',
      'devDependencies',
    ],
  },
  app: {
    middleware: {
      showErrorDetail: true,
    },
  },
  postgres: {
    connectionTimeoutMillis: 1000,
  },
  routes: {
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
  session: {
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      secure: true,
    },
  },
  store: {
    nukeable: false,
  },
  transports: {
    human: {
      level: 'debug',
    },
  },
};
