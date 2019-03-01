import { takeLatest, call, put } from 'redux-saga/effects';
import {
  FETCH_VERSION_REQUEST,
  FETCH_VERSION_SUCCESS,
  FETCH_VERSION_ERROR,
  fetchVersion,
} from '../modules/secretVersion';
import {
  getSecretVersionWithData,
} from '../lib/api';

export function* fetchVersionSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { params } = match;
  if (!params) return;
  const { version } = params;
  if (!version) return;

  yield put(FETCH_VERSION_REQUEST());
  try {
    const data = yield call(getSecretVersionWithData, version);
    yield put(FETCH_VERSION_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_VERSION_ERROR({ error: error.message }));
  }
}

export default [
  takeLatest(fetchVersion, fetchVersionSaga),
];
