import reduce, {
  initSecretOverview,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_VERSIONS_REQUEST,
  FETCH_VERSIONS_SUCCESS,
  FETCH_VERSIONS_ERROR,
  canManageRequest,
  setCanManage,
} from '../secretOverview';

describe('SecretOverview reducer', () => {
  it('should initialise page data with default state', () => {
    const defaultState = reduce(undefined, {});
    const state = reduce(undefined, initSecretOverview());
    expect(state).toMatchObject(defaultState);
  });

  it('should indicate when namespace is loading', () => {
    const state = reduce(undefined, FETCH_NAMESPACE_REQUEST());
    expect(state.meta).toMatchObject({ loading: { sections: { namespace: true } } });
  });

  it('should update state when namespace has loaded', () => {
    const initialState = reduce(undefined, {});
    const namespaceData = {
      id: '123',
    };

    const state = reduce(initialState, FETCH_NAMESPACE_SUCCESS({ data: namespaceData }));
    expect(state.namespace).toBe(namespaceData);
    expect(state.meta).toMatchObject({ loading: { sections: { namespace: false } } });
  });

  it('should update state when namespace has errored', () => {
    const initialState = {
      meta: {
        loading: {
          sections: { service: true },
        },
      },
    };
    const state = reduce(initialState, FETCH_NAMESPACE_ERROR({ error: 'Oh Noes' }));
    expect(state.meta).toMatchObject({
      loading: {
        sections: {
          namespace: false,
        },
      },
      error: 'Oh Noes',
    });
  });

  it('should set relevant loading state when requesting versions', () => {
    const state = reduce(undefined, FETCH_VERSIONS_REQUEST());
    expect(state.meta.loading).toMatchObject({
      sections: { versions: true },
    });
  });

  it('should update state when versions have loaded', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(undefined, FETCH_VERSIONS_SUCCESS({ data }));
    expect(state.versions).toBe(data);
    expect(state.meta.loading).toMatchObject({
      sections: { versions: false },
    });
  });

  it('should update state when versions have errored', () => {
    const state = reduce(undefined, FETCH_VERSIONS_ERROR({ error: 'Oh Noes' }));
    expect(state.meta).toMatchObject({
      loading: {
        sections: {
          versions: false,
        },
      },
      error: 'Oh Noes',
    });
  });


  it('should indicate when authorisation is loading', () => {
    const state = reduce(undefined, canManageRequest());
    expect(state.meta).toMatchObject({ loading: { sections: { canManage: true } } });
  });

  it('should set canManage in state', () => {
    const state = reduce(undefined, setCanManage(true));
    expect(state.canManage).toBe(true);
  });
});
