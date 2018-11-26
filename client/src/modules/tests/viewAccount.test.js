import reduce, {
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
  setCanEdit,
} from '../viewAccount';

describe('viewAccount Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, {});

  it('should indicate when namespaces are loading', () => {
    const state = reduce(createInitialState(), FETCH_NAMESPACES_REQUEST());
    expect(state.namespaces).toMatchObject({ count: 0, items: [] });
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { namespaces: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when namespaces have loaded', () => {
    const data = { count: 1, items: [{ a: 1 }] };
    const state = reduce(createInitialState(), FETCH_NAMESPACES_SUCCESS({ data }));
    expect(state.namespaces).toBe(data);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { namespaces: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when namespaces have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_NAMESPACES_ERROR({ error: 'Oh Noes' }));
    expect(state.namespaces).toBe(initialState.namespaces);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { namespaces: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should indicate when regisitries are loading', () => {
    const state = reduce(createInitialState(), FETCH_REGISTRIES_REQUEST());
    expect(state.registries).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { registries: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when regisitries have loaded', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(createInitialState(), FETCH_REGISTRIES_SUCCESS({ data }));
    expect(state.registries).toBe(data);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { registries: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when registries have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_REGISTRIES_ERROR({ error: 'Oh Noes' }));
    expect(state.registries).toBe(initialState.registries);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { registries: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

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
