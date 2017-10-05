import request from 'request-promise';
import errors from 'request-promise/errors';
import createSystem from './test-system';

describe('kubernaut', () => {

  let system;
  let config;

  beforeAll(cb => {
    system = createSystem().start((err, components) => {
      if (err) return cb(err);
      config = components.config;
      cb();
    });
  });

  afterAll(cb => {
    system.stop(cb);
  });

  it('should respond to status requests', async () => {

    expect.assertions(6);

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

    expect.assertions(5);

    await request({
      url: `http://${config.server.host}:${config.server.port}/__/unknown`,
      resolveWithFullResponse: true,
      followRedirect: false,
      json: true,
    }).catch(errors.StatusCodeError, (reason) => {
      expectStatus(reason.response, 404);
      expectHeader(reason.response, 'content-type', 'application/json; charset=utf-8');
      expectHeader(reason.response, 'cache-control', 'no-cache, no-store, must-revalidate');
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
