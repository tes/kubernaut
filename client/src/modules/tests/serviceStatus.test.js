import reduce, {
  initServiceStatusPage,
  fetchStatus,
  setCanManage,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR,
  FETCH_STATUS_REQUEST,
  FETCH_STATUS_SUCCESS,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
} from '../serviceStatus';

describe('ServiceStatus Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, initServiceStatusPage(...args));

  it('should indicate when latest deployments are loading', () => {
    const state = reduce(createInitialState(), FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST());
    expect(state.latestDeployments.data).toMatchObject([]);
    expect(state.meta.loading.sections.namespaces).toBe(true);
  });

  it('should update state when latest deployments have loaded', () => {
    const state = reduce(createInitialState(), FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS({ data: [{ namespace: { a: 1 } }] }));
    expect(state.latestDeployments.data).toMatchObject([{ a: 1}]);
    expect(state.meta.loading.sections.namespaces).toBe(false);
  });

  it('should update state when latest deployments have errored', () => {
    const state = reduce(createInitialState(), FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR({ error: 'Oh Noes' }));
    expect(state.latestDeployments.meta).toMatchObject({ error: 'Oh Noes' });
  });

  it('should indicate when service status is loading', () => {
    const state = reduce(createInitialState(), FETCH_STATUS_REQUEST());
    expect(state.status).toMatchObject([]);
    expect(state.meta.loading.sections.status).toBe(true);
  });

  it('should update state when service status has loaded', () => {
    const data = [{ createdAt: 2 }, { createdAt: 1 }];
    const state = reduce(createInitialState(), FETCH_STATUS_SUCCESS({ data }));
    expect(state.status).toMatchObject([{ createdAt: 2 }, { createdAt: 1 }]);
    expect(state.meta.loading.sections.status).toBe(false);
  });

  it('should initalise the page state', () => {
    const state = reduce({ canManage: true }, initServiceStatusPage());
    expect(state.canManage).toBe(false);
  });

  it('should set canManage', () => {
    const state = reduce({ canManage: false }, setCanManage(true));
    expect(state.canManage).toBe(true);
  });

  it('should initialise team state', () => {
    const initialState = {
      team: {
        name: 'bob',
      }
    };

    const state = reduce(initialState, FETCH_TEAM_REQUEST());
    expect(state.team).toMatchObject({
      name: '',
    });
  });

  it('should set team state', () => {
    const initialState = reduce({}, FETCH_TEAM_REQUEST());
    const team = {
      name: 'abc',
      services: [{ a: 1 }],
    };

    const state = reduce(initialState, FETCH_TEAM_SUCCESS({ data: team }));
    expect(state.team).toMatchObject({
      name: team.name,
      services: team.services,
    });
  });

  it('should initialise form fields', () => {
    const state = reduce(createInitialState(), fetchStatus({ namespaceId: 'abc' }));
    expect(state.initialValues).toMatchObject({ namespace: 'abc' });
  });
});
