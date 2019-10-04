import reduce, {
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
} from '../teams';

describe('Teams Reducer', () => {

  it('should indicate when teams are loading', () => {
    const state = reduce(undefined, FETCH_TEAMS_REQUEST());
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when teams have loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_TEAMS_SUCCESS({ data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] } }));
    expect(state.data.limit).toBe(50);
    expect(state.data.offset).toBe(0);
    expect(state.data.count).toBe(3);
    expect(state.data.items).toMatchObject([1, 2, 3]);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when teams have errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_TEAMS_ERROR({ error: 'Oh Noes' }));
    expect(state.data).toMatchObject(initialState.data);
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });

});
