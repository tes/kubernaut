import { put, call } from 'redux-saga/effects';
import {
  fetchAccountInfoSaga,
} from './account';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
} from '../modules/account';

import {
  getAccount,
} from '../lib/api';

describe('Account sagas', () => {
  it('should fetch account', () => {
    const accountData = { id: 123, roles: { admin: {} } };

    const gen = fetchAccountInfoSaga(fetchAccountInfo());
    expect(gen.next().value).toMatchObject(put(FETCH_ACCOUNT_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getAccount));
    expect(gen.next(accountData).value).toMatchObject(put(FETCH_ACCOUNT_SUCCESS({ data: accountData } )));
    expect(gen.next().done).toBe(true);
  });

  it('should tolerate errors fetching account info', () => {
    const error = new Error('ouch');
    const gen = fetchAccountInfoSaga(fetchAccountInfo({ quiet: true }));
    expect(gen.next().value).toMatchObject(put(FETCH_ACCOUNT_REQUEST()));
    expect(gen.next().value).toMatchObject(call(getAccount));
    expect(gen.throw(error).value).toMatchObject(put(FETCH_ACCOUNT_ERROR({ error: error.message })));
    expect(gen.next().done).toBe(true);
  });
});
