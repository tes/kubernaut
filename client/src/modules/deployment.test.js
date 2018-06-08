import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import reduce, {
  fetchDeployment,
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
} from './deployment';

const mockStore = configureStore([thunk]);

describe('Deployment Actions', () => {

  let actions;

  afterEach(() => {
    fetchMock.restore();
  });

  describe('Fetch an individiual deployment', () => {

    it('should fetch deployment', async () => {
      fetchMock.mock('/api/deployments/12345', { id: 12345 });

      await dispatchDeploymentActions(12345);
      expectRequest(FETCH_DEPLOYMENT_REQUEST, {});
      expectDeploymentSuccess({ id: 12345 });
    });

    it('should tolerate errors fetching deployment', async () => {
      fetchMock.mock('/api/deployments/12345', 403, );

      await dispatchDeploymentActions(12345);

      expectError(FETCH_DEPLOYMENT_ERROR, '/api/deployments/12345 returned 403 Forbidden');
    });

    it('should timeout fetching deployment', async () => {

      fetchMock.mock('/api/deployments/12345', {
        throws: new Error('simulate network timeout'),
      });

      await dispatchDeploymentActions(12345);

      expectError(FETCH_DEPLOYMENT_ERROR, 'simulate network timeout');
    });

    async function dispatchDeploymentActions(id, _options) {
      const store = mockStore({});
      const options = Object.assign({ quiet: true }, _options);
      await store.dispatch(fetchDeployment(id, options));
      actions = store.getActions();
      expect(actions).toHaveLength(2);
    }

    function expectDeploymentSuccess(deployment) {
      expect(Object.keys(actions[1]).length).toBe(2);
      expect(actions[1].type).toBe(FETCH_DEPLOYMENT_SUCCESS);
      expect(actions[1].data).toMatchObject(deployment);
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

describe('Deployment Reducer', () => {

  it('should indicate when deployment is loading', () => {
    const state = reduce(undefined, { type: FETCH_DEPLOYMENT_REQUEST, loading: true, data: {} });
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when deployment has loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENT_SUCCESS, data: { id: 12345 }});
    expect(state.data.id).toBe(12345);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when deployment has errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENT_ERROR, error: 'Oh Noes', data: {} });
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });

});
