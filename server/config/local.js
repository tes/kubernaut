module.exports = {
  logger: {
    transport: 'human',
  },
  transports: {
    human: {
      level: 'info',
    },
  },
  postgres: {
    database: 'postgres',
    user: 'postgres',
    connectionTimeoutMillis: 1000,
  },
  routes: {
  },
  server: {
    port: 3001,
  },
  store: {
    unsafe: true,
  },
  checksum: {
    key: 'cf31ec7e1ac4592fa95cb5b38e1b7e8878c995f4698e26a6b363a8e73fe24a27',
  },
};
