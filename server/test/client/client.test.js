import expect from 'expect';
import cheerio from 'cheerio';
import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from '../test-system';

describe('kubernaut', () => {

  let system;
  let config;

  before(async () => {
    system = createSystem();
    const components = await system.start();
    config = components.config;
  });

  after(async () => {
    await system.stop();
  });

  it('should respond to status requests', async () => {

    const res = await request({
      url: `http://${config.server.host}:${config.server.port}/__/status`,
      resolveWithFullResponse: true,
      followRedirect: false,
      json: true,
    });

    expectStatus(res, 200);
    expectHeader(res, 'content-type', 'application/json; charset=utf-8');
    expectHeader(res, 'cache-control', 'no-cache, no-store, must-revalidate');
    expect(res.body.name).toBe('kubernaut');
  });

  it('should respond with 404 to unknown admin requests', async () => {

    await request({
      url: `http://${config.server.host}:${config.server.port}/__/unknown`,
      resolveWithFullResponse: true,
      followRedirect: false,
      json: true,
    }).then(() => {
        throw new Error('Should have failed with 404');
    }).catch(errors.StatusCodeError, (reason) => {
      expectStatus(reason.response, 404);
      expectHeader(reason.response, 'content-type', 'application/json; charset=utf-8');
      expectHeader(reason.response, 'cache-control', 'no-cache, no-store, must-revalidate');
    });
  });

  it('should redirect to /login when requesting app and are logged out', async () => {
    await request({
      url: `http://${config.server.host}:${config.server.port}/`,
      resolveWithFullResponse: true,
      followRedirect: false,
      json: true,
    }).then(() => {
        throw new Error('Should have failed with 302');
    }).catch(errors.StatusCodeError, (reason) => {
      expectStatus(reason.response, 302);
      expectHeader(reason.response, 'location', '/login?return=%2f');
    });
  });

  describe('Logged in requests', () => {
    let jar;

    beforeEach(async () => {
      jar = request.jar();

      await request({
        url: `http://${config.server.host}:${config.server.port}/login`,
        method: 'POST',
        resolveWithFullResponse: true,
        simple: false,
        jar,
      });
    });

    it('should respond to client app requests', async () => {
      const res = await request({
        url: `http://${config.server.host}:${config.server.port}/`,
        resolveWithFullResponse: true,
        followRedirect: false,
        jar,
      });

      expectStatus(res, 200);
      expectHeader(res, 'content-type', 'text/html; charset=utf-8');
      expectHeader(res, 'cache-control', 'public, max-age=600, must-revalidate');
      expectHeader(res, 'etag');

      const $ = cheerio.load(res.body);
      expect($('title').text()).toBe('Kubernaut');
    });

    it('should redirect /index.html to /', async () => {

      await request({
        url: `http://${config.server.host}:${config.server.port}/index.html`,
        resolveWithFullResponse: true,
        followRedirect: false,
        jar,
      }).then(() => {
          throw new Error('Should have failed with 301');
      }).catch(errors.StatusCodeError, (reason) => {
        expectStatus(reason.response, 301);
        expectHeader(reason.response, 'location', '/');
      });
    });

    it('should respond to releases requests', async () => {

      const res = await request({
        url: `http://${config.server.host}:${config.server.port}/releases`,
        resolveWithFullResponse: true,
        followRedirect: false,
        jar,
      });

      expectStatus(res, 200);
      expectHeader(res, 'content-type', 'text/html; charset=utf-8');
      expectHeader(res, 'cache-control', 'public, max-age=600, must-revalidate');
      expectHeader(res, 'etag');

      const $ = cheerio.load(res.body);
      expect($('title').text()).toBe('Kubernaut');
    });

    it('should respond to deployments requests', async () => {

      const res = await request({
        url: `http://${config.server.host}:${config.server.port}/deployments`,
        resolveWithFullResponse: true,
        followRedirect: false,
        jar,
      });

      expectStatus(res, 200);
      expectHeader(res, 'content-type', 'text/html; charset=utf-8');
      expectHeader(res, 'cache-control', 'public, max-age=600, must-revalidate');
      expectHeader(res, 'etag');

      const $ = cheerio.load(res.body);
      expect($('title').text()).toBe('Kubernaut');
    });
  });

  function expectStatus(res, value) {
    expect(res.statusCode).toBe(value);
  }

  function expectHeader(res, name, value) {
    expect(res.headers[name]).toBeDefined();
    if (value) expect(res.headers[name].toLowerCase()).toBe(value);
  }

});
