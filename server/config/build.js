module.exports = {
  logger: {
    transport: 'human',
  },
  postgres: {
    hostname: 'postgres',
    database: 'postgres',
    user: 'postgres',
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
