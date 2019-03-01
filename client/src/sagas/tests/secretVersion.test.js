import { put, call } from 'redux-saga/effects';
import {
  fetchVersionSaga
} from '../secretVersion';

import {
  FETCH_VERSION_REQUEST,
  FETCH_VERSION_SUCCESS,
  FETCH_VERSION_ERROR,
  fetchVersion,
} from '../../modules/secretVersion';

import {
  getSecretVersionWithData,
} from '../../lib/api';

describe('secretVersion sagas', () => {
  describe('fetch', () => {
    const payload = { match: { params: {
      version: 1,
    }}};
    it('should fetch version data', () => {
      const versionData = { a: 1 };

      const gen = fetchVersionSaga(fetchVersion(payload));
      expect(gen.next().value).toMatchObject(put(FETCH_VERSION_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getSecretVersionWithData, 1));
      expect(gen.next(versionData).value).toMatchObject(put(FETCH_VERSION_SUCCESS({ data: versionData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching deployment info', () => {
      const error = new Error('ouch');
      const gen = fetchVersionSaga(fetchVersion({ ...payload, quiet: true }));
      expect(gen.next().value).toMatchObject(put(FETCH_VERSION_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getSecretVersionWithData, 1));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_VERSION_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });

  });
});
