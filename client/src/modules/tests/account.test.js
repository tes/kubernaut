import reduce, {
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
} from '../account';

describe('Account Reducer', () => {
  it('should indicate when account are loading', () => {
    const state = reduce(undefined, FETCH_ACCOUNT_REQUEST());
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when account have loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_ACCOUNT_SUCCESS({ data: { id: 123 }}));
    expect(state.data.id).toBe(123);
    expect(state.meta).toMatchObject({ loading: false });
  });

  it('should update state when account have errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_ACCOUNT_ERROR({ error: 'Oh Noes' }));
    expect(state.data).toMatchObject(initialState.data);
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });


});
