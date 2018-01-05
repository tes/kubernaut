import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import {
  fetchReleases,
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
} from './release';

const mockStore = configureStore([thunk,]);

describe('Release Actions', () => {

  let actions;

  afterEach(() => {
    fetchMock.restore();
  });

  it('should fetch releases', async () => {

    fetchMock.mock('/api/releases?limit=50&offset=0', { limit: 50, offset: 0, count: 3, items: [1, 2, 3,], });

    await dispatchReleasesActions();

    expectReleasesRequest();
    expectReleasesSuccess([1, 2, 3,]);
  });

  it('should tolerate errors fetching articles', async () => {

    fetchMock.mock('/api/releases?limit=50&offset=0', 500, );

    await dispatchReleasesActions();

    expectReleasesError('/api/releases?limit=50&offset=0 returned 500 Internal Server Error');
  });

  it('should tolerate failures fetching articles', async () => {

    fetchMock.mock('/api/releases?limit=50&offset=0', 403, );

    await dispatchReleasesActions();

    expectReleasesError('/api/releases?limit=50&offset=0 returned 403 Forbidden');
  });

  it('should timeout fetching article', async () => {

    fetchMock.mock('/api/releases?limit=50&offset=0', {
      throws: new Error('simulate network timeout'),
    });

    await dispatchReleasesActions();

    expectReleasesError('simulate network timeout');
  });

  async function dispatchReleasesActions(_options) {
    const store = mockStore({});
    const options = Object.assign({ page: 1, pageSize: 50, quiet: true, }, _options);
    await store.dispatch(fetchReleases(options));
    actions = store.getActions();
    expect(actions).toHaveLength(2);
  }

  function expectReleasesRequest() {
    expect(Object.keys(actions[0]).length).toBe(3);
    expect(actions[0].type).toBe(FETCH_RELEASES_REQUEST);
    expect(actions[0].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [], });
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
    expect(actions[1].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [], });
    expect(actions[1].error.message).toBe(msg);
  }

});
