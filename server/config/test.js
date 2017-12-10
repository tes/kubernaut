module.exports = {
  auth: [
    {
      id: 'local',
    },
  ],
  checksum: {
    key: 'cf31ec7e1ac4592fa95cb5b38e1b7e8878c995f4698e26a6b363a8e73fe24a27',
  },
  logger: {
    transport: 'human',
  },
  postgres: {
    hostname: 'localhost',
    database: 'postgres',
    user: 'postgres',
  },
  server: {
    port: 13000,
  },
  session: {
    store: 'memory',
    secret: 'secret',
  },
  store: {
    unsafe: true,
  },
  transports: {
    human: {
      level: 'error',
    },
  },
};
