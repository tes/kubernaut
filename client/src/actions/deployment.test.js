import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import {
  fetchDeployments,
  fetchDeployment,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
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
