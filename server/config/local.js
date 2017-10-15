module.exports = {
  logger: {
    transport: 'human',
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
    nukeable: true,
  },
};
