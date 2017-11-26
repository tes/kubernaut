module.exports = {
  checksum: {
    key: 'cf31ec7e1ac4592fa95cb5b38e1b7e8878c995f4698e26a6b363a8e73fe24a27',
  },
  logger: {
    transport: 'human',
  },
  routes: {
  },
  server: {
    port: 3001,
  },
  session: {
    store: 'postgres',
    secret: 'secret',
  },
  store: {
    unsafe: true,
  },
  transports: {
    human: {
      level: 'info',
    },
  },
};
