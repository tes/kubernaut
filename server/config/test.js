module.exports = {
  logger: {
    transport: 'human',
  },
  transports: {
    human: {
      level: 'error',
    },
  },
  postgres: {
    hostname: 'localhost',
    database: 'postgres',
    user: 'postgres',
    connectionTimeoutMillis: 100,
  },
  routes: {
  },
  server: {
    host: '0.0.0.0',
    port: 13000,
  },
  store: {
    unsafe: true,
  },
  checksum: {
    key: 'cf31ec7e1ac4592fa95cb5b38e1b7e8878c995f4698e26a6b363a8e73fe24a27',
  },
};
