import reduce, {
  fetchNamespacePageData,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
  setCanEdit,
  setCanManage,
} from '../namespace';

describe('Namespace Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, fetchNamespacePageData(...args));

  it('should indicate when namespace info is loading', () => {
    const state = reduce(createInitialState(), FETCH_NAMESPACE_REQUEST());
    expect(state.namespace.data).toMatchObject({});
    expect(state.namespace.meta).toMatchObject({ loading: true });
  });

  it('should update state when namespace info has loaded', () => {
    const data = { id: '123', name: 'abc', attributes: { a: 1 } };
    const state = reduce(createInitialState(), FETCH_NAMESPACE_SUCCESS({ data }));
    expect(state.namespace.data).toBe(data);
    expect(state.namespace.meta).toMatchObject({ loading: false });
  });

  it('should update state when namespace has errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_NAMESPACE_ERROR({ error: 'Oh Noes' }));
    expect(state.namespace.data).toBe(initialState.namespace.data);
    expect(state.namespace.meta).toMatchObject({ error: 'Oh Noes' });
  });

  it('should indicate when deployments are loading', () => {
    const state = reduce(createInitialState(), FETCH_DEPLOYMENTS_REQUEST());
    expect(state.deployments.data).toMatchObject({});
    expect(state.deployments.meta).toMatchObject({ loading: true });
  });

  it('should update state when deployments have loaded', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(createInitialState(), FETCH_DEPLOYMENTS_SUCCESS({ data }));
    expect(state.deployments.data).toBe(data);
    expect(state.deployments.meta).toMatchObject({ loading: false });
  });

  it('should update state when deployments have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_DEPLOYMENTS_ERROR({ error: 'Oh Noes' }));
    expect(state.deployments.data).toBe(initialState.deployments.data);
    expect(state.deployments.meta).toMatchObject({ error: 'Oh Noes' });
  });

  it('should update canEdit', () => {
    const state = reduce(undefined, setCanEdit(true));
    expect(state.canEdit).toBe(true);
  });

  it('should update canManage', () => {
    const state = reduce(undefined, setCanManage(true));
    expect(state.canManage).toBe(true);
  });
});
