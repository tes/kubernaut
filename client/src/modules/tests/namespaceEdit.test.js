import reduce, {
  initForm,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_CLUSTERS_REQUEST,
  FETCH_CLUSTERS_SUCCESS,
  FETCH_CLUSTERS_ERROR,
  canEditRequest,
  setCanEdit,
  canManageRequest,
  setCanManage,
} from '../namespaceEdit';

describe('NamespaceEdit reducer', () => {
  it('should initialise page data with default stage', () => {
    const defaultState = reduce(undefined, {});
    const state = reduce(undefined, initForm());
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
      name: 'abc',
      cluster: {
        id: '456',
        name: 'bob',
        color: 'black',
        context: 'abc',
      },
      attributes: {
        a: '1',
      },
    };

    const state = reduce(initialState, FETCH_NAMESPACE_SUCCESS({ data: namespaceData }));
    expect(state.id).toBe(namespaceData.id);
    expect(state.name).toBe(namespaceData.name);
    expect(state.color).toBe(namespaceData.cluster.color);
    expect(state.initialValues).toMatchObject({
      color: '',
      cluster: namespaceData.cluster.id,
      attributes: [{ name: 'a', value: namespaceData.attributes.a }],
    });

    expect(state.meta).toMatchObject({});
  });

  it('should update state when namespace has errored', () => {
    const initialState = {
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_NAMESPACE_ERROR({ error: 'Oh Noes' }));
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });

  it('should reset clusters data when loading', () => {
    const defaultState = reduce(undefined, {});
    const state = reduce({ meta: defaultState.meta, clusters: { data: { a: 1 } } }, FETCH_CLUSTERS_REQUEST());
    expect(state.clusters.data).toMatchObject(defaultState.clusters.data);
  });

  it('should update state when clusters have loaded', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(undefined, FETCH_CLUSTERS_SUCCESS({ data }));
    expect(state.clusters.data).toBe(data);
  });

  it('should update state when clusters have errored', () => {
    const state = reduce(undefined, FETCH_CLUSTERS_ERROR({ error: 'Oh Noes' }));
    expect(state.clusters.error).toBe('Oh Noes');
  });

  it('should indicate when authorisation is loading', () => {
    let state = reduce(undefined, canEditRequest());
    state = reduce(state, canManageRequest());
    expect(state.meta).toMatchObject({ loading: { sections: { canEdit: true, canManage: true } } });
  });

  it('should set canEdit in state', () => {
    const state = reduce(undefined, setCanEdit(true));
    expect(state.canEdit).toBe(true);
  });

  it('should set canManage in state', () => {
    const state = reduce(undefined, setCanManage(true));
    expect(state.canManage).toBe(true);
  });
});
