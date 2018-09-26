import { put, call, select } from 'redux-saga/effects';
import {
  fetchAccountsDataSaga,
} from '../accounts';

import {
  fetchAccountsPagination,
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
  selectTableFilters,
} from '../../modules/accounts';

import {
  getAccounts,
} from '../../lib/api';

describe('Accounts sagas', () => {
  it('should fetch accounts', () => {
    const accountsData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

    const gen = fetchAccountsDataSaga(fetchAccountsPagination());
    expect(gen.next().value).toMatchObject(select(selectTableFilters));
    expect(gen.next({}).value).toMatchObject(put(FETCH_ACCOUNTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getAccounts, { limit: 50, offset: 0 }));
    expect(gen.next(accountsData).value).toMatchObject(put(FETCH_ACCOUNTS_SUCCESS({ data: accountsData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching accounts info', () => {
    const error = new Error('ouch');
    const gen = fetchAccountsDataSaga(fetchAccountsPagination({ quiet: true }));
    expect(gen.next().value).toMatchObject(select(selectTableFilters));
    expect(gen.next({}).value).toMatchObject(put(FETCH_ACCOUNTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getAccounts, { limit: 50, offset: 0 }));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_ACCOUNTS_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });

  it('should fetch deployments pagination', () => {
    const accountsData = { limit: 50, offset: 50, count: 3, items: [1, 2, 3] };

    const gen = fetchAccountsDataSaga(fetchAccountsPagination({ page: 2 }));
    expect(gen.next().value).toMatchObject(select(selectTableFilters));
    expect(gen.next({}).value).toMatchObject(put(FETCH_ACCOUNTS_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getAccounts, { limit: 50, offset: 50 }));
    expect(gen.next(accountsData).value).toMatchObject(put(FETCH_ACCOUNTS_SUCCESS({ data: accountsData } )));
    expect(gen.next().done).toBe(true);
  });
});
