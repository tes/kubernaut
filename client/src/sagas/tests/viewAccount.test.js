import { call, put } from 'redux-saga/effects';

import {
  fetchAccountInfoSaga,
  checkPermissionSaga,
} from '../viewAccount';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  setCanEdit,
} from '../../modules/viewAccount';

import {
  getAccountById,
  hasPermission,
} from '../../lib/api';

const quietOptions = { quiet: true };

describe('viewAccount sagas', () => {
  describe('fetchAccountInfoSaga', () => {
    it('should fetch and succeed at getting account data', () => {
      const data = { a: 1 };
      const accountId = '123';
      const match = { params: { accountId } };
      const gen = fetchAccountInfoSaga(fetchAccountInfo({ match }));
      expect(gen.next().value).toMatchObject(put(FETCH_ACCOUNT_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountById, accountId));
      expect(gen.next(data).value).toMatchObject(put(FETCH_ACCOUNT_SUCCESS({ data })));
      expect(gen.next().done).toBe(true);
    });

    it('should handle errors', () => {
      const accountId = '123';
      const error = new Error('ouch');
      const match = { params: { accountId } };
      const gen = fetchAccountInfoSaga(fetchAccountInfo({ ...quietOptions, match }));
      expect(gen.next().value).toMatchObject(put(FETCH_ACCOUNT_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getAccountById, accountId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_ACCOUNT_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should check permission', () => {
    const gen = checkPermissionSaga(fetchAccountInfo());
    expect(gen.next().value).toMatchObject(call(hasPermission, 'accounts-write'));
    expect(gen.next({ answer: true }).value).toMatchObject(put(setCanEdit(true)));
    expect(gen.next().done).toBe(true);
  });
});
