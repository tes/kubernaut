import expect from 'expect';
import request from 'request-promise';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import { makeRelease, makeRootMeta } from '../factories';

describe('Services API', () => {

  let config;
  let system = { stop: cb => cb() };
  let store = { nuke: new Promise(cb => cb()) };

  const loggerOptions = {};

  before(async () => {
    system = createSystem()
      .set('transports.human', human(loggerOptions)).dependsOn('config');

    ({ config, store } = await system.start());
  });

  beforeEach(async () => {
    await store.nuke();
  });

  afterEach(() => {
    loggerOptions.suppress = false;
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });

  describe('GET /api/services', () => {

    beforeEach(async () => {

      await store.nuke();

      const releases = [];
      for (var i = 0; i < 51; i++) {
        releases.push({
          data: makeRelease(),
          meta: makeRootMeta(),
        });
      }

      await Promise.all(releases.map(async release => {
        await store.saveRelease(release.data, release.meta);
      }));
    });

    it('should return a list of services', async () => {
      const services = await request({
        url: `http://${config.server.host}:${config.server.port}/api/services`,
        method: 'GET',
        json: true,
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(50);
      expect(services.items.length).toBe(50);
    });

    it('should limit services list', async () => {

      const services = await request({
        url: `http://${config.server.host}:${config.server.port}/api/services`,
        qs: { limit: 40, offset: 0 },
        method: 'GET',
        json: true,
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(0);
      expect(services.limit).toBe(40);
      expect(services.items.length).toBe(40);
    });

    it('should page results', async () => {

      const services = await request({
        url: `http://${config.server.host}:${config.server.port}/api/services`,
        qs: { limit: 50, offset: 10 },
        method: 'GET',
        json: true,
      });

      expect(services.count).toBe(51);
      expect(services.offset).toBe(10);
      expect(services.limit).toBe(50);
      expect(services.items.length).toBe(41);
    });

  });
});
