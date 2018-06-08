import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import reduce, {
  fetchDeployments,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from './deployments';

const mockStore = configureStore([thunk]);

describe('Deployments Actions', () => {

  let actions;

  afterEach(() => {
    fetchMock.restore();
  });

  describe('Fetch multiple deployments', () => {

    it('should fetch deployments', async () => {

      fetchMock.mock('/api/deployments?limit=50&offset=0', { limit: 50, offset: 0, count: 3, items: [1, 2, 3] });

      await dispatchDeploymentsActions();

      expectRequest(FETCH_DEPLOYMENTS_REQUEST, { limit: 50, offset: 0, count: 0, items: [] });
      expectDeploymentsSuccess([1, 2, 3]);
    });

    it('should tolerate errors fetching deployments', async () => {

      fetchMock.mock('/api/deployments?limit=50&offset=0', 500, );

      await dispatchDeploymentsActions();

      expectError(FETCH_DEPLOYMENTS_ERROR, '/api/deployments?limit=50&offset=0 returned 500 Internal Server Error');
    });

    it('should timeout fetching deployments', async () => {

      fetchMock.mock('/api/deployments?limit=50&offset=0', {
        throws: new Error('simulate network timeout'),
      });

      await dispatchDeploymentsActions();

      expectError(FETCH_DEPLOYMENTS_ERROR, 'simulate network timeout');
    });

    async function dispatchDeploymentsActions(_options) {
      const store = mockStore({});
      const options = Object.assign({ page: 1, limit: 50, quiet: true }, _options);
      await store.dispatch(fetchDeployments(options));
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
  });

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

describe('Deployments Reducer', () => {

  it('should indicate when deployments are loading', () => {
    const state = reduce(undefined, { type: FETCH_DEPLOYMENTS_REQUEST, loading: true, data: {} });
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when deployments have loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENTS_SUCCESS, data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] }});
    expect(state.data.limit).toBe(50);
    expect(state.data.offset).toBe(0);
    expect(state.data.count).toBe(3);
    expect(state.data.items).toMatchObject([1, 2, 3]);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when deployments have errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENTS_ERROR, error: 'Oh Noes', data: {} });
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });

});
