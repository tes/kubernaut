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
};
