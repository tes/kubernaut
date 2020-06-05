module.exports = {
  auth: [
    {
      id: 'bearer',
      key: '108f3364c51b529ef449a99f800b6732bf9ff1136fbec3c6935a439ceae9586f',
    },
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
    host: 'local.tescloud.com',
    database: 'postgres',
    user: 'postgres',
    password: 'password',
  },
  server: {
    port: 13000,
  },
  session: {
    secret: 'secret',
    cookie: {
      secure: false,
    },
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
