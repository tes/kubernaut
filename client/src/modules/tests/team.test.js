import reduce, {
  fetchTeamPageData,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  FETCH_TEAM_SERVICES_REQUEST,
  FETCH_TEAM_SERVICES_SUCCESS,
  FETCH_TEAM_SERVICES_ERROR,
  FETCH_TEAM_MEMBERS_REQUEST,
  FETCH_TEAM_MEMBERS_SUCCESS,
  FETCH_TEAM_MEMBERS_ERROR,
  setCanEdit,
} from '../team';

describe('Team Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, fetchTeamPageData(...args));

  describe('team', () => {
    it('should indicate when team info is loading', () => {
      const state = reduce(createInitialState(), FETCH_TEAM_REQUEST());
      expect(state.team.data).toMatchObject({});
      expect(state.meta.loading.sections.team).toBe(true);
    });

    it('should update state when team info has loaded', () => {
      const data = { id: '123', name: 'abc', attributes: { a: 1 } };
      const state = reduce(createInitialState(), FETCH_TEAM_SUCCESS({ data }));
      expect(state.team.data).toBe(data);
      expect(state.meta.loading.sections.team).toBe(false);
    });

    it('should update state when team has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_TEAM_ERROR({ error: 'Oh Noes' }));
      expect(state.team.data).toBe(initialState.team.data);
      expect(state.meta.loading.sections.team).toBe(false);
    });
  });

  describe('services', () => {
    it('should indicate when service info is loading', () => {
      const state = reduce(createInitialState(), FETCH_TEAM_SERVICES_REQUEST());
      expect(state.services).toMatchObject(createInitialState().services);
      expect(state.meta.loading.sections.services).toBe(true);
    });

    it('should update state when service info has loaded', () => {
      const data = { limit: 5, offset: 5, count: 30, pages: 6, page: 2, items: [{a: 1}] };
      const state = reduce(createInitialState(), FETCH_TEAM_SERVICES_SUCCESS({ data }));
      expect(state.services.data).toBe(data);
      expect(state.meta.loading.sections.services).toBe(false);
    });

    it('should update state when service has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_TEAM_SERVICES_ERROR({ error: 'Oh Noes' }));
      expect(state.services.data).toBe(initialState.services.data);
      expect(state.meta.loading.sections.services).toBe(false);
    });
  });

  describe('members', () => {
    it('should indicate when member info is loading', () => {
      const state = reduce(createInitialState(), FETCH_TEAM_MEMBERS_REQUEST());
      expect(state.members).toMatchObject(createInitialState().members);
      expect(state.meta.loading.sections.members).toBe(true);
    });

    it('should update state when member info has loaded', () => {
      const data = { limit: 5, offset: 5, count: 30, pages: 6, page: 2, items: [{a: 1}] };
      const state = reduce(createInitialState(), FETCH_TEAM_MEMBERS_SUCCESS({ data }));
      expect(state.members.data).toBe(data);
      expect(state.meta.loading.sections.members).toBe(false);
    });

    it('should update state when member has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_TEAM_MEMBERS_ERROR({ error: 'Oh Noes' }));
      expect(state.members.data).toBe(initialState.members.data);
      expect(state.meta.loading.sections.members).toBe(false);
    });
  });

  it('should set canEdit', () => {
    const state = reduce(createInitialState(), setCanEdit(true));
    expect(state.canEdit).toBe(true);
  });
});
