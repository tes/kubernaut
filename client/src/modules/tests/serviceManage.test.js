import reduce, {
  initServiceManage,
  updateServiceStatusSuccess,
  FETCH_SERVICE_REQUEST,
  FETCH_SERVICE_SUCCESS,
  FETCH_SERVICE_ERROR,
  FETCH_SERVICE_NAMESPACES_STATUS_REQUEST,
  FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS,
  FETCH_SERVICE_NAMESPACES_STATUS_ERROR,
  canManageRequest,
  setCanManage,
} from '../serviceManage';

describe('NamespaceManage reducer', () => {
  it('should initialise page data with default state', () => {
    const defaultState = reduce(undefined, {});
    const state = reduce(undefined, initServiceManage());
    expect(state).toMatchObject(defaultState);
  });

  it('should indicate when service is loading', () => {
    const state = reduce(undefined, FETCH_SERVICE_REQUEST());
    expect(state.meta).toMatchObject({ loading: { sections: { service: true } } });
  });

  it('should update state when service has loaded', () => {
    const initialState = reduce(undefined, {});
    const serviceData = {
      id: '123',
    };

    const state = reduce(initialState, FETCH_SERVICE_SUCCESS({ data: serviceData }));
    expect(state.id).toBe(serviceData.id);
    expect(state.meta).toMatchObject({ loading: { sections: { service: false } } });
  });

  it('should update state when service has errored', () => {
    const initialState = {
      meta: {
        loading: {
          sections: { service: true },
        },
      },
    };
    const state = reduce(initialState, FETCH_SERVICE_ERROR({ error: 'Oh Noes' }));
    expect(state.meta).toMatchObject({
      loading: {
        sections: {
          service: false,
        },
      },
      error: 'Oh Noes',
    });
  });

  it('should set relevant loading state when requesting namespaces', () => {
    const state = reduce(undefined, FETCH_SERVICE_NAMESPACES_STATUS_REQUEST());
    expect(state.meta.loading).toMatchObject({
      sections: { namespaces: true },
    });
  });

  it('should update state when namespaces have loaded', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(undefined, FETCH_SERVICE_NAMESPACES_STATUS_SUCCESS({ data }));
    expect(state.namespaces).toBe(data);
    expect(state.initialValues).toMatchObject({ namespaces: data.items });
    expect(state.meta.loading).toMatchObject({
      sections: { namespaces: false },
    });
  });

  it('should update state when services have errored', () => {
    const state = reduce(undefined, FETCH_SERVICE_NAMESPACES_STATUS_ERROR({ error: 'Oh Noes' }));
    expect(state.meta).toMatchObject({
      loading: {
        sections: {
          namespaces: false,
        },
      },
      error: 'Oh Noes',
    });
  });

  it('should update namespaces data on success of updating status', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(undefined, updateServiceStatusSuccess({ data }));
    expect(state.namespaces).toBe(data);
    expect(state.initialValues).toMatchObject({ namespaces: data.items });
    expect(state.meta.loading).toMatchObject({
      sections: { namespaces: false },
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
