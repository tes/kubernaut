import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import {
  fetchRegistries,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
} from './registry';

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
    expect(Object.keys(actions[0]).length).toBe(3);
    expect(actions[0].type).toBe(FETCH_REGISTRIES_REQUEST);
    expect(actions[0].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [] });
    expect(actions[0].loading).toBe(true);
  }

  function expectRegistriesSuccess(registries) {
    expect(Object.keys(actions[1]).length).toBe(2);
    expect(actions[1].type).toBe(FETCH_REGISTRIES_SUCCESS);
    expect(actions[1].data.items).toMatchObject(registries);
    expect(actions[1].data.count).toBe(registries.length);
    expect(actions[1].data.limit).toBe(50);
    expect(actions[1].data.offset).toBe(0);
  }

  function expectRegistriesError(msg) {
    expect(Object.keys(actions[1]).length).toBe(3);
    expect(actions[1].type).toBe(FETCH_REGISTRIES_ERROR);
    expect(actions[1].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [] });
    expect(actions[1].error.message).toBe(msg);
  }

});
