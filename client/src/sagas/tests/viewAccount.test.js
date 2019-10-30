import { call, put, select } from 'redux-saga/effects';

import {
  fetchAccountInfoSaga,
  checkPermissionSaga,
  generateBearerSaga,
} from '../viewAccount';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  setCanEdit,
  setCanManageTeam,
  setCanGenerate,
  setBearerToken,
  generateBearer,
} from '../../modules/viewAccount';
import { selectAccount } from '../../modules/account';

import {
  getAccountById,
  hasPermission,
  getCanManageAnyTeam,
  getBearerTokenForAccount,
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

  describe('checkPermissionSaga', () => {
    it('should check permission on page load', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const gen = checkPermissionSaga(fetchAccountInfo({ match }));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next({ id: '' }).value).toMatchObject(call(hasPermission, 'accounts-bearer'));
      expect(gen.next({ answer: true }).value).toMatchObject(put(setCanGenerate(true)));
      expect(gen.next().value).toMatchObject(call(hasPermission, 'accounts-write'));
      expect(gen.next({ answer: true }).value).toMatchObject(put(setCanEdit(true)));
      expect(gen.next().value).toMatchObject(call(getCanManageAnyTeam));
      expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManageTeam(true)));
      expect(gen.next().done).toBe(true);
    });

    it('should set canGenerate when it is the same account as logged in user', () => {
      const accountId = '123';
      const match = { params: { accountId } };
      const gen = checkPermissionSaga(fetchAccountInfo({ match }));
      expect(gen.next().value).toMatchObject(select(selectAccount));
      expect(gen.next({ id: accountId }).value).toMatchObject(put(setCanGenerate(true)));
      expect(gen.next().value).toMatchObject(call(hasPermission, 'accounts-write'));
      expect(gen.next({ answer: true }).value).toMatchObject(put(setCanEdit(true)));
      expect(gen.next().value).toMatchObject(call(getCanManageAnyTeam));
      expect(gen.next({ answer: true }).value).toMatchObject(put(setCanManageTeam(true)));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('generateBearerSaga', () => {
    it('fetches a bearer token', () => {
      const gen = generateBearerSaga(generateBearer({ id: 'abc' }));
      expect(gen.next().value).toMatchObject(call(getBearerTokenForAccount, 'abc'));
      expect(gen.next({ bearer: '123abc' }).value).toMatchObject(put(setBearerToken('123abc')));
      expect(gen.next().done).toBe(true);
    });
  });
});
