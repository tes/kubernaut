import reduce, {
  INITIALISE,
  SET_LOADING,
  CLEAR_LOADING,
  SET_REGISTRIES,
  SET_NAMESPACES,
  SET_DEPLOYMENTS,
  setServiceSuggestions,
  clearServiceSuggestions,
  setCanManage,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
} from '../deploy';

describe('Deploy Form Reducer', () => {

  it('should initialise to default state', () => {
    const state = reduce(undefined, INITIALISE());
    expect(state).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: false });
    expect(state.registries).toMatchObject([]);
    expect(state.namespaces).toMatchObject([]);
  });

  it('should set a loading state', () => {
    const state = reduce(undefined, SET_LOADING());
    expect(state).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should clear a loading state', () => {
    const initialState = reduce(undefined, SET_LOADING());

    const state = reduce(initialState, CLEAR_LOADING());
    expect(state).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: false });
  });

  it('should set registries data', () => {
    const state = reduce(undefined, SET_REGISTRIES({ data: ['bob'] }));
    expect(state).toMatchObject({});
    expect(state.registries).toMatchObject(['bob']);
  });

  it('should set namespaces data', () => {
    const state = reduce(undefined, SET_NAMESPACES({ data: ['bob'] }));
    expect(state).toMatchObject({});
    expect(state.namespaces).toMatchObject(['bob']);
  });

  it('sets service suggestions', () => {
    const state = reduce(undefined, setServiceSuggestions([1,2,3]));
    expect(state.serviceSuggestions).toMatchObject([1,2,3]);
  });

  it('clears service suggestions', () => {
    const state = reduce({ serviceSuggestions: [1,2,3]}, clearServiceSuggestions());
    expect(state.serviceSuggestions).toMatchObject([]);
  });

  it('should set deployments data', () => {
    const state = reduce(undefined, SET_DEPLOYMENTS({ data: ['bob'] }));
    expect(state).toMatchObject({});
    expect(state.deployments).toMatchObject(['bob']);
  });

  it('should set canManage', () => {
    const state = reduce({ canManage: false }, setCanManage(true));
    expect(state.canManage).toBe(true);
  });

  it('should initialise team state', () => {
    const initialState = {
      team: {
        name: 'bob',
      }
    };

    const state = reduce(initialState, FETCH_TEAM_REQUEST());
    expect(state.team).toMatchObject({
      name: '',
    });
  });

  it('should set team state', () => {
    const initialState = reduce({}, FETCH_TEAM_REQUEST());
    const team = {
      name: 'abc',
      services: [{ a: 1 }],
    };

    const state = reduce(initialState, FETCH_TEAM_SUCCESS({ data: team }));
    expect(state.team).toMatchObject({
      name: team.name,
      services: team.services,
    });
  });
});
