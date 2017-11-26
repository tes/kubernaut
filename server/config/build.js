module.exports = {
  auth: {
    middleware: {
      loginUrl: '/auth/test',
    },
    strategies: [
      {
        id: 'test',
      },
      {
        id: 'bearer',
        users: [
          {
            id: 'machine-user/ava',
            token: 'ava',
          },
        ],
      },
    ],
  },
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
  session: {
    store: 'memory',
    secret: 'secret',
  },
  store: {
    nukeable: true,
  },
};
