import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import reduce, {
  fetchReleasesForService,
  fetchDeploymentHistoryForService,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from './service';

const mockStore = configureStore([thunk]);

describe('Service Actions', () => {

  let actions;

  afterEach(() => {
    fetchMock.restore();
  });

  it('should fetch releases', async () => {

    fetchMock.mock('/api/releases?limit=50&offset=0&service=bob&registry=default&', { limit: 50, offset: 0, count: 3, items: [1, 2, 3] });

    await dispatchReleasesActions();

    expectReleasesRequest();
    expectReleasesSuccess([1, 2, 3]);
  });

  it('should tolerate errors fetching releases', async () => {

    fetchMock.mock('/api/releases?limit=50&offset=0&service=bob&registry=default&', 500, );

    await dispatchReleasesActions();

    expectReleasesError('/api/releases?limit=50&offset=0&service=bob&registry=default& returned 500 Internal Server Error');
  });

  it('should tolerate failures fetching releases', async () => {

    fetchMock.mock('/api/releases?limit=50&offset=0&service=bob&registry=default&', 403, );

    await dispatchReleasesActions();

    expectReleasesError('/api/releases?limit=50&offset=0&service=bob&registry=default& returned 403 Forbidden');
  });

  it('should fetch deployments', async () => {

    fetchMock.mock('/api/deployments?limit=50&offset=0&service=bob&registry=default&', { limit: 50, offset: 0, count: 3, items: [1, 2, 3] });

    await dispatchDeploymentsActions();

    expectRequest(FETCH_DEPLOYMENTS_REQUEST, { limit: 50, offset: 0, count: 0, items: [] });
    expectDeploymentsSuccess([1, 2, 3]);
  });

  it('should tolerate errors fetching deployments', async () => {

    fetchMock.mock('/api/deployments?limit=50&offset=0&service=bob&registry=default&', 500, );

    await dispatchDeploymentsActions();

    expectError(FETCH_DEPLOYMENTS_ERROR, '/api/deployments?limit=50&offset=0&service=bob&registry=default& returned 500 Internal Server Error');
  });

  async function dispatchReleasesActions(_options) {
    const store = mockStore({});
    const options = Object.assign({ service: 'bob', registry: 'default', page: 1, limit: 50, quiet: true }, _options);
    await store.dispatch(fetchReleasesForService(options));
    actions = store.getActions();
    expect(actions).toHaveLength(2);
  }

  function expectReleasesRequest() {
    expect(Object.keys(actions[0]).length).toBe(3);
    expect(actions[0].type).toBe(FETCH_RELEASES_REQUEST);
    expect(actions[0].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [] });
    expect(actions[0].loading).toBe(true);
  }

  function expectReleasesSuccess(releases) {
    expect(Object.keys(actions[1]).length).toBe(2);
    expect(actions[1].type).toBe(FETCH_RELEASES_SUCCESS);
    expect(actions[1].data.items).toMatchObject(releases);
    expect(actions[1].data.count).toBe(releases.length);
    expect(actions[1].data.limit).toBe(50);
    expect(actions[1].data.offset).toBe(0);
  }

  function expectReleasesError(msg) {
    expect(Object.keys(actions[1]).length).toBe(3);
    expect(actions[1].type).toBe(FETCH_RELEASES_ERROR);
    expect(actions[1].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [] });
    expect(actions[1].error.message).toBe(msg);
  }

  async function dispatchDeploymentsActions(_options) {
    const store = mockStore({});
    const options = Object.assign({ service: 'bob', registry: 'default', page: 1, limit: 50, quiet: true }, _options);
    await store.dispatch(fetchDeploymentHistoryForService(options));
    actions = store.getActions();
    expect(actions).toHaveLength(2);
  }

  function expectDeploymentsSuccess(deployments) {
    expect(Object.keys(actions[1]).length).toBe(2);
    expect(actions[1].type).toBe(FETCH_DEPLOYMENTS_SUCCESS);
    expect(actions[1].data.items).toMatchObject(deployments);
    expect(actions[1].data.count).toBe(deployments.length);
    expect(actions[1].data.limit).toBe(50);
    expect(actions[1].data.offset).toBe(0);
  }

  function expectRequest(action, data) {
    expect(Object.keys(actions[0]).length).toBe(3);
    expect(actions[0].type).toBe(action);
    expect(actions[0].data).toMatchObject(data);
    expect(actions[0].loading).toBe(true);
  }

  function expectError(action, msg) {
    expect(Object.keys(actions[1]).length).toBe(3);
    expect(actions[1].type).toBe(action);
    expect(actions[1].data).toMatchObject({});
    expect(actions[1].error.message).toBe(msg);
  }

});

describe('Service Reducer', () => {

  it('should indicate when releases are loading', () => {
    const state = reduce(undefined, { type: FETCH_RELEASES_REQUEST, loading: true, data: {} });
    expect(state.releases.data).toMatchObject({});
    expect(state.releases.meta).toMatchObject({ loading: true });
  });

  it('should update state when releases have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_RELEASES_SUCCESS, data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] } });
    expect(state.releases.data.limit).toBe(50);
    expect(state.releases.data.offset).toBe(0);
    expect(state.releases.data.count).toBe(3);
    expect(state.releases.data.items).toMatchObject([1, 2, 3]);
    expect(state.releases.meta).toMatchObject({});
  });

  it('should update state when releases have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_RELEASES_ERROR, error: 'Oh Noes', data: {} });
    expect(state.releases.data).toMatchObject({});
    expect(state.releases.meta).toMatchObject({ error: 'Oh Noes' });
  });

  it('should indicate when deployments are loading', () => {
    const state = reduce(undefined, { type: FETCH_DEPLOYMENTS_REQUEST, loading: true, data: {} });
    expect(state.deployments.data).toMatchObject({});
    expect(state.deployments.meta).toMatchObject({ loading: true });
  });

  it('should update state when deployments have loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENTS_SUCCESS, data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] }});
    expect(state.deployments.data.limit).toBe(50);
    expect(state.deployments.data.offset).toBe(0);
    expect(state.deployments.data.count).toBe(3);
    expect(state.deployments.data.items).toMatchObject([1, 2, 3]);
    expect(state.deployments.meta).toMatchObject({});
  });

  it('should update state when deployments have errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENTS_ERROR, error: 'Oh Noes', data: {} });
    expect(state.deployments.data).toMatchObject({});
    expect(state.deployments.meta).toMatchObject({ error: 'Oh Noes' });
  });

});
