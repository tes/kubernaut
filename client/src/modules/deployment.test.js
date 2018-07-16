import reduce, {
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
} from './deployment';

describe('Deployment Reducer', () => {

  it('should indicate when deployment is loading', () => {
    const state = reduce(undefined, FETCH_DEPLOYMENT_REQUEST());
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when deployment has loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_DEPLOYMENT_SUCCESS({ data: { id: 12345 }}));
    expect(state.data.id).toBe(12345);
    expect(state.meta).toMatchObject({ loading: false });
  });

  it('should update state when deployment has errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_DEPLOYMENT_ERROR({ error: 'Oh Noes' }));
    expect(state.data).toMatchObject(initialState.data);
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });

});
