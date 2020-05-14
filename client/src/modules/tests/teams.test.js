import reduce, {
  initialiseTeamsPage,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
} from '../teams';

describe('Teams Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, initialiseTeamsPage(...args));

  describe('teams', () => {
    it('should indicate when teams info is loading', () => {
      const state = reduce(createInitialState(), FETCH_TEAMS_REQUEST());
      expect(state.teams).toMatchObject(createInitialState().teams);
      expect(state.meta.loading.sections.teams).toBe(true);
    });

    it('should update state when teams info has loaded', () => {
      const data = { limit: 5, offset: 5, count: 30, pages: 6, page: 2, items: [{a: 1}] };
      const state = reduce(createInitialState(), FETCH_TEAMS_SUCCESS({ data }));
      expect(state.teams.data).toBe(data);
      expect(state.meta.loading.sections.teams).toBe(false);
    });

    it('should update state when teams has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_TEAMS_ERROR({ error: 'Oh Noes' }));
      expect(state.teams.data).toBe(initialState.teams.data);
      expect(state.meta.loading.sections.teams).toBe(false);
    });
  });

  describe('services', () => {
    it('should indicate when services info is loading', () => {
      const state = reduce(createInitialState(), FETCH_SERVICES_REQUEST());
      expect(state.services).toMatchObject(createInitialState().services);
      expect(state.meta.loading.sections.services).toBe(true);
    });

    it('should update state when services info has loaded', () => {
      const data = { limit: 5, offset: 5, count: 30, pages: 6, page: 2, items: [{a: 1}] };
      const state = reduce(createInitialState(), FETCH_SERVICES_SUCCESS({ data }));
      expect(state.services.data).toBe(data);
      expect(state.meta.loading.sections.services).toBe(false);
    });

    it('should update state when services has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_SERVICES_ERROR({ error: 'Oh Noes' }));
      expect(state.services.data).toBe(initialState.services.data);
      expect(state.meta.loading.sections.services).toBe(false);
    });
  });

  describe('accounts', () => {
    it('should indicate when accounts info is loading', () => {
      const state = reduce(createInitialState(), FETCH_ACCOUNTS_REQUEST());
      expect(state.accounts).toMatchObject(createInitialState().accounts);
      expect(state.meta.loading.sections.accounts).toBe(true);
    });

    it('should update state when accounts info has loaded', () => {
      const data = { limit: 5, offset: 5, count: 30, pages: 6, page: 2, items: [{a: 1}] };
      const state = reduce(createInitialState(), FETCH_ACCOUNTS_SUCCESS({ data }));
      expect(state.accounts.data).toBe(data);
      expect(state.meta.loading.sections.accounts).toBe(false);
    });

    it('should update state when accounts has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_ACCOUNTS_ERROR({ error: 'Oh Noes' }));
      expect(state.accounts.data).toBe(initialState.accounts.data);
      expect(state.meta.loading.sections.accounts).toBe(false);
    });
  });

});
