import expect from 'expect';
import createSystem from '../test-system';
import {
  makeRegistry,
  makeAccount,
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

  function saveTeam(team = makeTeam(), meta = makeRootMeta()) {
    return store.saveTeam(team, meta);
  }
});
