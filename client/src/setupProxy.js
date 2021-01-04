const { createProxyMiddleware: proxy } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(proxy('/api', { target: 'http://localhost:3001/' }));
  app.use(proxy('/auth/github', { target: 'http://localhost:3001/' }));
  app.use(proxy('/login', { target: 'http://localhost:3001/' }));
};
