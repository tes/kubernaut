import reduce, {
  fetchTeamPageData,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
} from '../team';

describe('Team Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, fetchTeamPageData(...args));

  it('should indicate when team info is loading', () => {
    const state = reduce(createInitialState(), FETCH_TEAM_REQUEST());
    expect(state.team.data).toMatchObject({});
    expect(state.team.meta).toMatchObject({ loading: true });
  });

  it('should update state when team info has loaded', () => {
    const data = { id: '123', name: 'abc', attributes: { a: 1 } };
    const state = reduce(createInitialState(), FETCH_TEAM_SUCCESS({ data }));
    expect(state.team.data).toBe(data);
    expect(state.team.meta).toMatchObject({ loading: false });
  });

  it('should update state when team has errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_TEAM_ERROR({ error: 'Oh Noes' }));
    expect(state.team.data).toBe(initialState.team.data);
    expect(state.team.meta).toMatchObject({ error: 'Oh Noes' });
  });
});
