import reduce, {
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR,
} from '../service';

describe('Service Reducer', () => {

  it('should indicate when releases are loading', () => {
    const state = reduce(undefined, FETCH_RELEASES_REQUEST());
    expect(state.releases.data).toMatchObject({});
    expect(state.releases.meta).toMatchObject({ loading: true });
  });

  it('should update state when releases have loaded', () => {
    const initialState = {
      releases: {
        data: {},
        meta: {
          loading: true,
        },
      },
    };
    const state = reduce(initialState, FETCH_RELEASES_SUCCESS({ data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] } }));
    expect(state.releases.data.limit).toBe(50);
    expect(state.releases.data.offset).toBe(0);
    expect(state.releases.data.count).toBe(3);
    expect(state.releases.data.items).toMatchObject([1, 2, 3]);
    expect(state.releases.meta).toMatchObject({ loading: false });
  });

  it('should update state when releases have errored', () => {
    const initialState = {
      releases: {
        data: {},
        meta: {
          loading: true,
        },
      },
    };
    const state = reduce(initialState, FETCH_RELEASES_ERROR({ error: 'Oh Noes' }));
    expect(state.releases.data).toMatchObject(initialState.releases.data);
    expect(state.releases.meta).toMatchObject({ error: 'Oh Noes' });
  });

  it('should indicate when deployments are loading', () => {
    const state = reduce(undefined, FETCH_DEPLOYMENTS_REQUEST());
    expect(state.deployments.data).toMatchObject({});
    expect(state.deployments.meta).toMatchObject({ loading: true });
  });

  it('should update state when deployments have loaded', () => {
    const initialState = {
      deployments: {
        data: [],
        meta: {
          loading: true,
        },
      },
    };
    const state = reduce(initialState, FETCH_DEPLOYMENTS_SUCCESS({ data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] }}));
    expect(state.deployments.data.limit).toBe(50);
    expect(state.deployments.data.offset).toBe(0);
    expect(state.deployments.data.count).toBe(3);
    expect(state.deployments.data.items).toMatchObject([1, 2, 3]);
    expect(state.deployments.meta).toMatchObject({ loading: false });
  });

  it('should update state when deployments have errored', () => {
    const initialState = {
      deployments: {
        data: [],
        meta: {
          loading: true,
        },
      },
    };
    const state = reduce(initialState, FETCH_DEPLOYMENTS_ERROR({ error: 'Oh Noes' }));
    expect(state.deployments.data).toMatchObject(initialState.deployments.data);
    expect(state.deployments.meta).toMatchObject({ error: 'Oh Noes' });
  });

  it('should indicate when latest deployments are loading', () => {
    const state = reduce(undefined, FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST());
    expect(state.latestDeployments.data).toMatchObject([]);
    expect(state.latestDeployments.meta).toMatchObject({ loading: true });
  });

  it('should update state when latest deployments have loaded', () => {
    const initialState = {
      latestDeployments: {
        data: [],
        meta: {
          loading: true,
        },
      },
    };
    const state = reduce(initialState, FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS({ data: [{ a:1 }] }));
    expect(state.latestDeployments.data).toMatchObject([{ a: 1}]);
    expect(state.latestDeployments.meta).toMatchObject({ loading: false });
  });

  it('should update state when latest deployments have errored', () => {
    const initialState = {
      latestDeployments: {
        data: [],
        meta: {
          loading: true,
        },
      },
    };
    const state = reduce(initialState, FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR({ error: 'Oh Noes' }));
    expect(state.latestDeployments.data).toMatchObject(initialState.latestDeployments.data);
    expect(state.latestDeployments.meta).toMatchObject({ error: 'Oh Noes' });
  });
});
