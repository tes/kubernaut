import reduce, {
  initialise,
  updateServiceStatusSuccess,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_SERVICES_NAMESPACE_STATUS_REQUEST,
  FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS,
  FETCH_SERVICES_NAMESPACE_STATUS_ERROR,
} from '../namespaceManage';

describe('NamespaceManage reducer', () => {
  it('should initialise page data with default state', () => {
    const defaultState = reduce(undefined, {});
    const state = reduce(undefined, initialise());
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
      context: 'abc',
      cluster: {
        id: '456',
        name: 'bob',
        color: 'black',
      },
      attributes: {
        a: '1',
      },
    };

    const state = reduce(initialState, FETCH_NAMESPACE_SUCCESS({ data: namespaceData }));
    expect(state.id).toBe(namespaceData.id);
    expect(state.name).toBe(namespaceData.name);
    expect(state.color).toBe(namespaceData.cluster.color);
    expect(state.meta).toMatchObject({ loading: { sections: { namespace: false } } });
  });

  it('should update state when namespace has errored', () => {
    const initialState = {
      meta: {
        loading: {
          sections: { namespace: true },
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

  it('should set relevant loading state when requesting services', () => {
    const state = reduce(undefined, FETCH_SERVICES_NAMESPACE_STATUS_REQUEST());
    expect(state.meta.loading).toMatchObject({
      sections: { services: true },
    });
  });

  it('should update state when services have loaded', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(undefined, FETCH_SERVICES_NAMESPACE_STATUS_SUCCESS({ data }));
    expect(state.services).toBe(data);
    expect(state.initialValues).toMatchObject({ services: data.items });
    expect(state.meta.loading).toMatchObject({
      sections: { services: false },
    });
  });

  it('should update state when services have errored', () => {
    const state = reduce(undefined, FETCH_SERVICES_NAMESPACE_STATUS_ERROR({ error: 'Oh Noes' }));
    expect(state.meta).toMatchObject({
      loading: {
        sections: {
          services: false,
        },
      },
      error: 'Oh Noes',
    });
  });

  it('should update service data on success of updating status', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(undefined, updateServiceStatusSuccess({ data }));
    expect(state.services).toBe(data);
    expect(state.initialValues).toMatchObject({ services: data.items });
    expect(state.meta.loading).toMatchObject({
      sections: { services: false },
    });
  });
});
