import expect from 'expect';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import {
  makeRootMeta,
  makeService,
  makeRelease,
  makeTeam,
  makeRequestWithDefaults,
} from '../factories';

describe('Teams API', () => {
  let request;
  let config;
  let system = { stop: cb => cb() };
  let store = { nuke: () => new Promise(cb => cb()) };
  const loggerOptions = {};

  before(async () => {
    system = createSystem()
      .set('transports.human', human(loggerOptions)).dependsOn('config');

    ({ config, store } = await system.start());
    request = makeRequestWithDefaults(config);
  });

  beforeEach(async () => {
    await store.nuke();
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });
  afterEach(() => {
    loggerOptions.suppress = false;
  });

  describe('Teams', () => {
    describe('GET /api/teams', () => {
      beforeEach(async () => {

        await store.nuke();

        let i = 0;
        while (i < 51) {
          try {
            // random team names aren't so random ... keep trying till they don't collide
            await saveTeam();
            i++;
          } catch (e) {
            if (e.code !== '23505') throw e; // only throw when its not a unique violation
          }
        }
      });

      it('should return a list of teams', async () => {
        const teams = await request({
          url: `/api/teams`,
          method: 'GET',
        });

        expect(teams.count).toBe(51);
        expect(teams.offset).toBe(0);
        expect(teams.limit).toBe(50);
        expect(teams.items.length).toBe(50);
      });

      it('should limit teams list', async () => {

        const teams = await request({
          url: `/api/teams`,
          qs: { limit: 40, offset: 0 },
          method: 'GET',
        });

        expect(teams.count).toBe(51);
        expect(teams.offset).toBe(0);
        expect(teams.limit).toBe(40);
        expect(teams.items.length).toBe(40);
      });

      it('should page results', async () => {

        const teams = await request({
          url: `/api/teams`,
          qs: { limit: 50, offset: 10 },
          method: 'GET',
        });

        expect(teams.count).toBe(51);
        expect(teams.offset).toBe(10);
        expect(teams.limit).toBe(50);
        expect(teams.items.length).toBe(41);
      });
    });

    describe('/api/teams/:id', () => {
      it('retrieves a team', async () => {
        const team = await store.getTeam(await saveTeam(makeTeam({ attributes: { a: 'bc' } })));

        const response = await request({
          url: `/api/teams/${team.id}`,
          method: 'GET',
        });

        expect(response.id).toBe(team.id);
        expect(response.name).toBe(team.name);
        expect(response.attributes).toMatchObject(team.attributes);
      });

      it('404s for nonexistent team', async () => {
        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/142bc001-1819-459b-bf95-14e25be17fe5`,
          method: 'GET',
          resolveWithFullResponse: true,
        }).then(() => {
          throw new Error('Should have failed with 404');
        }).catch(errors.StatusCodeError, reason => {
          expect(reason.response.statusCode).toBe(404);
        });
      });
    });


    describe('/api/teams/by-name/:name', () => {
      it('retrieves a team by name', async () => {
        const team = await store.getTeam(await saveTeam(makeTeam({ attributes: { a: 'bc' } })));

        const response = await request({
          url: `/api/teams/by-name/${team.name}`,
          method: 'GET',
        });

        expect(response.id).toBe(team.id);
        expect(response.name).toBe(team.name);
        expect(response.attributes).toMatchObject(team.attributes);
      });

      it('404s for nonexistent team name', async () => {
        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/by-name/bob`,
          method: 'GET',
          resolveWithFullResponse: true,
        }).then(() => {
          throw new Error('Should have failed with 404');
        }).catch(errors.StatusCodeError, reason => {
          expect(reason.response.statusCode).toBe(404);
        });
      });
    });

    describe('/api/teams/for/:registry/:service', () => {
      it('retrieves a team for a service it is associated with', async () => {
        const team = await store.getTeam(await saveTeam(makeTeam({ attributes: { a: 'bc' } })));
        const service = await saveService(makeService({ name: 'app-1' }));
        await associateServiceWithTeam(service, team);

        const response = await request({
          url: `/api/teams/for/${service.registry.name}/${service.name}`,
          method: 'GET',
        });

        expect(response.id).toBe(team.id);
        expect(response.name).toBe(team.name);
        expect(response.attributes).toMatchObject(team.attributes);
      });

      it('404s when service has no association', async () => {
        loggerOptions.suppress = true;

        const service = await saveService(makeService({ name: 'app-1' }));

        await request({
          url: `/api/teams/for/${service.registry.name}/${service.name}`,
          method: 'GET',
          resolveWithFullResponse: true,
        }).then(() => {
          throw new Error('Should have failed with 404');
        }).catch(errors.StatusCodeError, reason => {
          expect(reason.response.statusCode).toBe(404);
        });
      });
    });
  });

  function saveTeam(team = makeTeam(), meta = makeRootMeta()) {
    return store.saveTeam(team, meta);
  }

  function associateServiceWithTeam(service, team = makeTeam()) {
    return store.associateServiceWithTeam(service, team);
  }

  async function saveService(service = makeService(), meta = makeRootMeta()) {
    const release = await store.saveRelease(makeRelease({ service }), meta);
    return release.service;
  }
});
