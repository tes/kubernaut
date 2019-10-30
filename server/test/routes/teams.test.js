import expect from 'expect';
import errors from 'request-promise/errors';
import createSystem from '../test-system';
import human from '../../lib/components/logger/human';
import {
  makeRootMeta,
  makeService,
  makeRelease,
  makeCluster,
  makeNamespace,
  makeRegistry,
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

    describe('GET /api/teams/:id', () => {
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

    describe('POST /api/teams/:id/attributes', () => {
      it('updates a teams attributes', async () => {
        const team = await store.getTeam(await saveTeam(makeTeam({ attributes: { a: 'bc' } })));

        const response = await request({
          url: `/api/teams/${team.id}/attributes`,
          method: 'POST',
          json: {
            a: 'bc',
            d: 'ef',
          }
        });

        expect(response.id).toBe(team.id);
        expect(response.attributes).toMatchObject({
          a: 'bc',
          d: 'ef',
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

    describe('POST /api/teams/roles/namespace', () => {

      it('should grant a role on a namespace to a team', async () => {

        const cluster = await store.saveCluster(makeCluster(), makeRootMeta());
        const namespace = await store.saveNamespace(makeNamespace({ cluster }), makeRootMeta());
        const saved = await store.saveTeam(makeTeam(), makeRootMeta());

        const response = await request({
          url: `/api/teams/roles/namespace`,
          method: 'POST',
          json: {
            team: saved,
            role: 'admin',
            namespace: namespace.id,
          },
        });

        expect(response.currentRoles).toBeDefined();
        expect(response.namespacesWithoutRoles).toBeDefined();
        expect(response.rolesGrantable).toBeDefined();
        expect(response.currentRoles.length).toBe(1);
        const entry = response.currentRoles[0];
        expect(entry.namespace.id).toBe(namespace.id);
        expect(entry.roles).toMatchObject(['admin']);
      });

      it('should reject payloads without a team', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/namespace`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            role: 'admin',
            namespace: 'ns',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('team is required');
        });
      });

      it('should reject payloads without a role', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/namespace`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            team: 'acc',
            namespace: 'ns',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('role is required');
        });
      });

      it('should reject payloads without a namespace', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/namespace`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            team: 'acc',
            role: 'admin',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('namespace is required');
        });
      });
    });

    describe('POST /api/teams/roles/registry', () => {

      it('should grant a role on a registry to a team', async () => {

        const registry = await store.saveRegistry(makeRegistry(), makeRootMeta());
        const saved = await store.saveTeam(makeTeam(), makeRootMeta());

        const response = await request({
          url: `/api/teams/roles/registry`,
          method: 'POST',
          json: {
            team: saved,
            role: 'admin',
            registry: registry.id,
          },
        });

        expect(response.currentRoles).toBeDefined();
        expect(response.registriesWithoutRoles).toBeDefined();
        expect(response.rolesGrantable).toBeDefined();
        expect(response.currentRoles.length).toBe(1);
        const entry = response.currentRoles[0];
        expect(entry.registry.id).toBe(registry.id);
        expect(entry.roles).toMatchObject(['admin']);
      });

      it('should reject payloads without a team', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/registry`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            role: 'admin',
            registry: 'reg',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('team is required');
        });
      });

      it('should reject payloads without a role', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/registry`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            team: 'acc',
            registry: 'reg',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('role is required');
        });
      });

      it('should reject payloads without a registry', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/registry`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            team: 'acc',
            role: 'admin',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('registry is required');
        });
      });
    });

    describe('POST /api/teams/roles/team', () => {

      it('should grant a role on a team to a team', async () => {

        const team = await store.saveTeam(makeTeam(), makeRootMeta());
        const saved = await store.saveTeam(makeTeam(), makeRootMeta());

        const response = await request({
          url: `/api/teams/roles/team`,
          method: 'POST',
          json: {
            team: saved,
            role: 'admin',
            subjectTeam: team,
          },
        });

        expect(response.currentRoles).toBeDefined();
        expect(response.teamsWithoutRoles).toBeDefined();
        expect(response.rolesGrantable).toBeDefined();
        expect(response.currentRoles.length).toBe(1);
        const entry = response.currentRoles[0];
        expect(entry.team.id).toBe(team);
        expect(entry.roles).toMatchObject(['admin']);
      });

      it('should reject payloads without a team', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/team`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            role: 'admin',
            subjectTeam: 'teamidabc',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('team is required');
        });
      });

      it('should reject payloads without a role', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/team`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            team: 'acc',
            subjectTeam: 'teamidabc',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('role is required');
        });
      });

      it('should reject payloads without a subject team', async () => {

        loggerOptions.suppress = true;

        await request({
          url: `/api/teams/roles/team`,
          method: 'POST',
          resolveWithFullResponse: true,
          json: {
            team: 'acc',
            role: 'admin',
          },
        }).then(() => {
          throw new Error('Should have failed with 400');
        }).catch(errors.StatusCodeError, (reason) => {
          expect(reason.response.statusCode).toBe(400);
          expect(reason.response.body.message).toBe('subjectTeam is required');
        });
      });
    });

    describe('POST /api/teams/association/service', () => {

      it('should associate a service with a team', async () => {
        const service = await saveService();
        const team = await saveTeam();

        const response = await request({
          url: `/api/teams/association/service`,
          method: 'POST',
          json: {
            team,
            service: service.id
          },
        });

        expect(response).toBeDefined();
        expect(response.id).toBe(team);

        expect((await store.getTeamForService(service)).id).toBe(team);
      });
    });

    describe('DELETE /api/teams/association/service', () => {

      it('should disassociates a service from a team', async () => {
        const service = await saveService();
        const team = await saveTeam();
        await associateServiceWithTeam(service, { id: team });

        const response = await request({
          url: `/api/teams/association/service`,
          method: 'DELETE',
          json: {
            service: service.id
          },
        });

        expect(response).toBeDefined();

        expect(await store.getTeamForService(service)).toBe(undefined);
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
