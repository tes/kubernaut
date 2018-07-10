import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import reduce, {
  fetchRegistries,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
} from './registries';

const mockStore = configureStore([thunk]);

describe('Registry Actions', () => {

  let actions;

  afterEach(() => {
    fetchMock.restore();
  });

  it('should fetch registries', async () => {

    fetchMock.mock('/api/registries?limit=50&offset=0', { limit: 50, offset: 0, count: 3, items: [1, 2, 3] });

    await dispatchRegistriesActions();

    expectRegistriesRequest();
    expectRegistriesSuccess([1, 2, 3]);
  });

  it('should tolerate errors fetching registries', async () => {

    fetchMock.mock('/api/registries?limit=50&offset=0', 500, );

    await dispatchRegistriesActions();

    expectRegistriesError('/api/registries?limit=50&offset=0 returned 500 Internal Server Error');
  });

  it('should tolerate failures fetching registries', async () => {

    fetchMock.mock('/api/registries?limit=50&offset=0', 403, );

    await dispatchRegistriesActions();

    expectRegistriesError('/api/registries?limit=50&offset=0 returned 403 Forbidden');
  });

  it('should timeout fetching article', async () => {

    fetchMock.mock('/api/registries?limit=50&offset=0', {
      throws: new Error('simulate network timeout'),
    });

    await dispatchRegistriesActions();

    expectRegistriesError('simulate network timeout');
  });

  async function dispatchRegistriesActions(_options) {
    const store = mockStore({});
    const options = Object.assign({ page: 1, limit: 50, quiet: true }, _options);
    await store.dispatch(fetchRegistries(options));
    actions = store.getActions();
    expect(actions).toHaveLength(2);
  }

  function expectRegistriesRequest() {
    expect(actions[0].type).toBe(FETCH_REGISTRIES_REQUEST.toString());
    expect(Object.keys(actions[0].payload).length).toBe(2);
    expect(actions[0].payload.data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [] });
    expect(actions[0].payload.loading).toBe(true);
  }

  function expectRegistriesSuccess(registries) {
    expect(actions[1].type).toBe(FETCH_REGISTRIES_SUCCESS.toString());
    expect(Object.keys(actions[1].payload).length).toBe(1);
    expect(actions[1].payload.data.items).toMatchObject(registries);
    expect(actions[1].payload.data.count).toBe(registries.length);
    expect(actions[1].payload.data.limit).toBe(50);
    expect(actions[1].payload.data.offset).toBe(0);
  }

  function expectRegistriesError(msg) {
    expect(actions[1].type).toBe(FETCH_REGISTRIES_ERROR.toString());
    expect(Object.keys(actions[1].payload).length).toBe(2);
    expect(actions[1].payload.data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [] });
    expect(actions[1].payload.error.message).toBe(msg);
  }

});

describe('Registries Reducer', () => {

  it('should indicate when registries are loading', () => {
    const state = reduce(undefined, FETCH_REGISTRIES_REQUEST({ loading: true, data: {} }));
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when registries have loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_REGISTRIES_SUCCESS({ data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] }}));
    expect(state.data.limit).toBe(50);
    expect(state.data.offset).toBe(0);
    expect(state.data.count).toBe(3);
    expect(state.data.items).toMatchObject([1, 2, 3]);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when registries have errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_REGISTRIES_ERROR({ error: 'Oh Noes', data: {} }));
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });

});
