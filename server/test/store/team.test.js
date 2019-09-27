import expect from 'expect';
import createSystem from '../test-system';
import {
  makeService,
  makeRelease,
  makeRootMeta,
  makeTeam,
} from '../factories';

describe('Team store', () => {
  let system = { stop: cb => cb() };
  let store = { nuke: () => new Promise(cb => cb()) };

  before(async () => {
    system = createSystem().remove('server');
    ({ store } = await system.start());
  });

  beforeEach(async () => {
    await store.nuke();
  });

  after(async () => {
    await store.nuke();
    await system.stop();
  });

  describe('Saving', () => {
      it('saves a team and gets it by id', async () => {
        const id = await saveTeam(makeTeam({
          name: 'A team name',
          attributes: {
            abc: 'def',
            xyz: 'abc',
          },
        }));

        const team = await store.getTeam(id);
        expect(team.name).toBe('A team name');
        expect(team.attributes).toMatchObject({
          abc: 'def',
          xyz: 'abc',
        });
      });
  });

  describe('findTeams', () => {
    it('should find all teams', async () => {
      await saveTeam(makeTeam({ name: 'engineers' }));
      await saveTeam(makeTeam({ name: 'mentors', attributes: { abc: 123 } }));

      const results = await store.findTeams();
      expect(results).toBeDefined();
      expect(results).toMatchObject({
        offset: 0,
        count: 2
      });
      expect(results.items[0].name).toBe('engineers');
      expect(results.items[1].name).toBe('mentors');
      expect(results.items[1].attributes).toMatchObject({
        abc: '123',
      });
    });
  });

  describe('service association', () => {
    it('associates a service with a team', async () => {
      const service = await saveService(makeService({ name: 'app-1' }));
      const service2 = await saveService(makeService({ name: 'app-2' }));
      const team = await store.getTeam(await saveTeam());

      await associateServiceWithTeam(service, team);
      await associateServiceWithTeam(service2, team);

      const result = await store.getTeam(team.id);
      expect(result).toBeDefined();
      expect(result.services).toBeDefined();
      expect(result.services.length).toBe(2);
      expect(result.services).toMatchObject([
        {
          name: 'app-1'
        },
        {
          name: 'app-2'
        }
      ]);
    });

    it('re-associates a service with another team', async () => {
      const service = await saveService(makeService({ name: 'app-1' }));
      const service2 = await saveService(makeService({ name: 'app-2' }));
      const team = await store.getTeam(await saveTeam());
      const team2 = await store.getTeam(await saveTeam());

      await associateServiceWithTeam(service, team);
      await associateServiceWithTeam(service2, team);

      const result = await store.getTeam(team.id);
      expect(result.services).toMatchObject([
        {
          name: 'app-1'
        },
        {
          name: 'app-2'
        }
      ]);

      await associateServiceWithTeam(service2, team2);
      const results = [await store.getTeam(team.id), await store.getTeam(team2.id)];
      expect(results[0]).toBeDefined();
      expect(results[0].services.length).toBe(1);
      expect(results[0].services).toMatchObject([
        {
          name: 'app-1'
        }
      ]);
      expect(results[1]).toBeDefined();
      expect(results[1].services.length).toBe(1);
      expect(results[1].services).toMatchObject([
        {
          name: 'app-2'
        }
      ]);
    });

    it('disassociates a service from a team', async () => {
      const service = await saveService();
      const team = await store.getTeam(await saveTeam());

      await associateServiceWithTeam(service, team);
      expect((await store.getTeam(team.id)).services.length).toBe(1);

      await store.disassociateService(service);
      expect((await store.getTeam(team.id)).services.length).toBe(0);
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
