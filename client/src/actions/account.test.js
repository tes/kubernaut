import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import {
  fetchAccounts,
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
} from './account';

const mockStore = configureStore([thunk]);

describe('Account Actions', () => {

  let actions;

  afterEach(() => {
    fetchMock.restore();
  });

  it('should fetch accounts', async () => {

    fetchMock.mock('/api/accounts?limit=50&offset=0', { limit: 50, offset: 0, count: 3, items: [1, 2, 3] });

    await dispatchAccountsActions();

    expectAccountsRequest();
    expectAccountsSuccess([1, 2, 3]);
  });

  it('should tolerate errors fetching accounts', async () => {

    fetchMock.mock('/api/accounts?limit=50&offset=0', 500, );

    await dispatchAccountsActions();

    expectAccountsError('/api/accounts?limit=50&offset=0 returned 500 Internal Server Error');
  });

  it('should tolerate failures fetching accounts', async () => {

    fetchMock.mock('/api/accounts?limit=50&offset=0', 403, );

    await dispatchAccountsActions();

    expectAccountsError('/api/accounts?limit=50&offset=0 returned 403 Forbidden');
  });

  it('should timeout fetching article', async () => {

    fetchMock.mock('/api/accounts?limit=50&offset=0', {
      throws: new Error('simulate network timeout'),
    });

    await dispatchAccountsActions();

    expectAccountsError('simulate network timeout');
  });

  async function dispatchAccountsActions(_options) {
    const store = mockStore({});
    const options = Object.assign({ page: 1, limit: 50, quiet: true }, _options);
    await store.dispatch(fetchAccounts(options));
    actions = store.getActions();
    expect(actions).toHaveLength(2);
  }

  function expectAccountsRequest() {
    expect(Object.keys(actions[0]).length).toBe(3);
    expect(actions[0].type).toBe(FETCH_ACCOUNTS_REQUEST);
    expect(actions[0].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [] });
    expect(actions[0].loading).toBe(true);
  }

  function expectAccountsSuccess(accounts) {
    expect(Object.keys(actions[1]).length).toBe(2);
    expect(actions[1].type).toBe(FETCH_ACCOUNTS_SUCCESS);
    expect(actions[1].data.items).toMatchObject(accounts);
    expect(actions[1].data.count).toBe(accounts.length);
    expect(actions[1].data.limit).toBe(50);
    expect(actions[1].data.offset).toBe(0);
  }

  function expectAccountsError(msg) {
    expect(Object.keys(actions[1]).length).toBe(3);
    expect(actions[1].type).toBe(FETCH_ACCOUNTS_ERROR);
    expect(actions[1].data).toMatchObject({ limit: 50, offset: 0, count: 0, items: [] });
    expect(actions[1].error.message).toBe(msg);
  }

});
