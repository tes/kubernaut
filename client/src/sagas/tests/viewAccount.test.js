import { call, put } from 'redux-saga/effects';

import {
  fetchAccountInfoSaga,
  fetchNamespacesSaga,
  fetchRegistriesSaga,
} from '../viewAccount';

import {
  fetchAccountInfo,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
} from '../../modules/viewAccount';

import {
  getAccountById,
  getNamespaces,
  getRegistries,
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

  describe('fetchNamespacesSaga', () => {
    it('should fetch namespaces', () => {
      const namespacesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchNamespacesSaga(fetchAccountInfo());
      expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getNamespaces));
      expect(gen.next(namespacesData).value).toMatchObject(put(FETCH_NAMESPACES_SUCCESS({ data: namespacesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching namespaces', () => {
      const error = new Error('ouch');
      const gen = fetchNamespacesSaga(fetchAccountInfo(quietOptions));
      expect(gen.next().value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getNamespaces));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_NAMESPACES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetchRegistriesSaga', () => {
    it('should fetch registries', () => {
      const registriesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchRegistriesSaga(fetchAccountInfo());
      expect(gen.next().value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getRegistries));
      expect(gen.next(registriesData).value).toMatchObject(put(FETCH_REGISTRIES_SUCCESS({ data: registriesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching registries', () => {
      const error = new Error('ouch');
      const gen = fetchRegistriesSaga(fetchAccountInfo(quietOptions));
      expect(gen.next().value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getRegistries));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_REGISTRIES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });
});
