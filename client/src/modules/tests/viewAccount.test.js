import reduce, {
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  setCanEdit,
} from '../viewAccount';

describe('viewAccount Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, {});

  it('should indicate when account is loading', () => {
    const state = reduce(createInitialState(), FETCH_ACCOUNT_REQUEST());
    expect(state.account).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { account: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when account has loaded', () => {
    const data = { a: 1 };
    const state = reduce(createInitialState(), FETCH_ACCOUNT_SUCCESS({ data }));
    expect(state.account).toBe(data);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { account: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when account has errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_ACCOUNT_ERROR({ error: 'Oh Noes' }));
    expect(state.account).toBe(initialState.account);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { account: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should set canEdit state', () => {
    const state = reduce(undefined, setCanEdit(true));
    expect(state.canEdit).toBe(true);
  });
});
