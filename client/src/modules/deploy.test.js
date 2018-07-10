import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import { SubmissionError } from 'redux-form';
import { CALL_HISTORY_METHOD } from 'connected-react-router';
import reduce, {
  initialise,
  triggerDeployment,
  INITIALISE,
  INITIALISE_ERROR,
  SET_LOADING,
  CLEAR_LOADING,
  SET_REGISTRIES,
  SET_NAMESPACES,
} from './deploy';

const mockStore = configureStore([thunk]);

describe('Deploy Form Actions', () => {

  let actions;

  afterEach(() => {
    fetchMock.restore();
  });

  describe('initialise', () => {
    it('should initialise and fetch form data', async () => {
      fetchMock.mock('/api/registries', {
        limit:50,
        offset:0,
        count:1,
        items: [
          { name: 'default' },
        ],
      });

      const defaultNamespace = { name: 'default', cluster: { name: 'local '} };

      fetchMock.mock('/api/namespaces', {
        limit:50,
        offset:0,
        count:1,
        items: [
          defaultNamespace,
        ],
      });

      await dispatchInitialise();
      await expectInitialiseSuccess(['default'], [defaultNamespace]);
    });

    it('should handle errors for registries', async () => {
      fetchMock.mock('/api/registries', 403, );

      await dispatchInitialise();

      expectError(INITIALISE_ERROR.toString(), '/api/registries returned 403 Forbidden');
    });

    it('should handle errors for namespaces', async () => {
      fetchMock.mock('/api/registries', {
        limit:50,
        offset:0,
        count:1,
        items: [
          { name: 'default' },
        ],
      });
      fetchMock.mock('/api/namespaces', 403, );

      await dispatchInitialise();

      expectError(INITIALISE_ERROR.toString(), '/api/namespaces returned 403 Forbidden');
    });

    async function dispatchInitialise() {
      const store = mockStore({});
      await store.dispatch(initialise({ quiet: true }));
      actions = store.getActions();
    }

    async function expectInitialiseSuccess(registryData, namespaceData) {
      expect(actions).toHaveLength(5);
      expect(actions[2].type).toBe(SET_REGISTRIES.toString());
      expect(actions[2].payload.data).toMatchObject(registryData);
      expect(actions[4].type).toBe(SET_NAMESPACES.toString());
      expect(actions[4].payload.data).toMatchObject(namespaceData);
    }
  });

  describe('triggerDeployment', () => {
    const formValues = {
      registry: 'abc',
      service: 'abc',
      version: 'abc',
      cluster: 'abc',
      namespace: 'abc',
    };

    it('should submit form data', async () => {
      fetchMock.mock('/api/deployments?', {
        id: 'abcdef123',
      }, {
        method: 'POST',
      });

      await dispatchTriggerDeployment(formValues);
      await expectPush('/deployments/abcdef123');
    });

    it('should handle api errors', async () => {
      fetchMock.mock('/api/deployments?', 403, { method: 'POST' });
      expect.assertions(2);

      try {
        await dispatchTriggerDeployment(formValues);
      } catch(e) {
        expect(e).toBeInstanceOf(SubmissionError);
        expect(e.errors).toMatchObject({
          _error: '/api/deployments? returned 403 Forbidden',
        });
      }
    });

    async function dispatchTriggerDeployment(formData) {
      const store = mockStore({});
      await store.dispatch(triggerDeployment(formData, { quiet: true }));
      actions = store.getActions();
    }

    async function expectPush(location) {
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(CALL_HISTORY_METHOD);
      expect(actions[0].payload).toMatchObject({});
      expect(actions[0].payload.method).toBe('push');
      expect(actions[0].payload.args).toMatchObject([location]);
    }
  });

  function expectError(action, msg) {
    const errorAction = actions.find(({ type }) => (type === action));
    expect(errorAction).not.toBe(undefined);
    expect(errorAction.payload.error.message).toBe(msg);
  }

});

describe('Deploy Form Reducer', () => {

  it('should initialise to default state', () => {
    const state = reduce(undefined, INITIALISE());
    expect(state).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: false });
    expect(state.registries).toMatchObject([]);
    expect(state.namespaces).toMatchObject([]);
  });

  it('should set a loading state', () => {
    const state = reduce(undefined, SET_LOADING());
    expect(state).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should clear a loading state', () => {
    const initialState = reduce(undefined, SET_LOADING());

    const state = reduce(initialState, CLEAR_LOADING());
    expect(state).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: false });
  });

  it('should set registries data', () => {
    const state = reduce(undefined, SET_REGISTRIES({ data: ['bob'] }));
    expect(state).toMatchObject({});
    expect(state.registries).toMatchObject(['bob']);
  });

  it('should set namespaces data', () => {
    const state = reduce(undefined, SET_NAMESPACES({ data: ['bob'] }));
    expect(state).toMatchObject({});
    expect(state.namespaces).toMatchObject(['bob']);
  });
});
