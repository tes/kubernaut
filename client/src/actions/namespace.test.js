import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import {
  fetchNamespaces,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
} from './namespace';

const mockStore = configureStore([thunk,]);

describe('Namespace Actions', () => {

  let actions;

  afterEach(() => {
    fetchMock.restore();
  });

  it('should fetch namespaces', async () => {

    fetchMock.mock('/api/namespaces?limit=50&offset=0', { limit: 50, offset: 0, count: 3, items: [1, 2, 3,], });

    await dispatchNamespacesActions();

    expectNamespacesRequest();
    expectNamespacesSuccess([1, 2, 3,]);
  });

  it('should tolerate errors fetching articles', async () => {

    fetchMock.mock('/api/namespaces?limit=50&offset=0', 500, );

    await dispatchNamespacesActions();

    expectNamespacesError('/api/namespaces?limit=50&offset=0 returned 500 Internal Server Error');
  });

  it('should tolerate failures fetching articles', async () => {

    fetchMock.mock('/api/namespaces?limit=50&offset=0', 403, );

    await dispatchNamespacesActions();

    expectNamespacesError('/api/namespaces?limit=50&offset=0 returned 403 Forbidden');
  });

  it('should timeout fetching article', async () => {

    fetchMock.mock('/api/namespaces?limit=50&offset=0', {
      throws: new Error('simulate network timeout'),
    });

    await dispatchNamespacesActions();

    expectNamespacesError('simulate network timeout');
  });

  async function dispatchNamespacesActions(_options) {
    const store = mockStore({});
    const options = Object.assign({ page: 1, pageSize: 50, quiet: true, }, _options);
    await store.dispatch(fetchNamespaces(options));
    actions = store.getActions();
    expect(actions).toHaveLength(2);
  }

  function expectNamespacesRequest() {
    expect(Object.keys(actions[0]).length).toBe(3);
    expect(actions[0].type).toBe(FETCH_NAMESPACES_REQUEST);
    expect(actions[0].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [], });
    expect(actions[0].loading).toBe(true);
  }

  function expectNamespacesSuccess(namespaces) {
    expect(Object.keys(actions[1]).length).toBe(2);
    expect(actions[1].type).toBe(FETCH_NAMESPACES_SUCCESS);
    expect(actions[1].data.items).toMatchObject(namespaces);
    expect(actions[1].data.count).toBe(namespaces.length);
    expect(actions[1].data.limit).toBe(50);
    expect(actions[1].data.offset).toBe(0);
  }

  function expectNamespacesError(msg) {
    expect(Object.keys(actions[1]).length).toBe(3);
    expect(actions[1].type).toBe(FETCH_NAMESPACES_ERROR);
    expect(actions[1].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [], });
    expect(actions[1].error.message).toBe(msg);
  }

});
