import reduce, {
  FETCH_JOBS_REQUEST,
  FETCH_JOBS_SUCCESS,
  FETCH_JOBS_ERROR,
  setNamespaces,
  setRegistries,
} from '../jobs';

describe('Jobs Reducer', () => {

  it('should indicate when jobs are loading', () => {
    const state = reduce(undefined, FETCH_JOBS_REQUEST());
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when jobs have loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_JOBS_SUCCESS({ data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] } }));
    expect(state.data.limit).toBe(50);
    expect(state.data.offset).toBe(0);
    expect(state.data.count).toBe(3);
    expect(state.data.items).toMatchObject([1, 2, 3]);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when jobs have errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_JOBS_ERROR({ error: 'Oh Noes' }));
    expect(state.data).toMatchObject(initialState.data);
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });

  it('should set namespaces data', () => {
    const namespaces = { count : 3, items: [1,2,3] };
    const initialState = { namespaces: {}, registries: { count: 1}, canCreate: false };

    const state = reduce(initialState, setNamespaces({ data: namespaces }));
    expect(state.namespaces).toMatchObject(namespaces);
    expect(state.canCreate).toBe(true);
  });

  it('should set registries data', () => {
    const registries = { count : 3, items: [1,2,3] };
    const initialState = { namespaces: { count: 1 }, registries: {}, canCreate: false };

    const state = reduce(initialState, setRegistries({ data: registries }));
    expect(state.registries).toMatchObject(registries);
    expect(state.canCreate).toBe(true);
  });
});
