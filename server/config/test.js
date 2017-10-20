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
    nukeable: true,
  },
};
