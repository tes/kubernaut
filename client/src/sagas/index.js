import { all, takeEvery, call, put } from 'redux-saga/effects';
import {
  fetchNamespace,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
} from '../modules/namespace';
import { getNamespace } from '../lib/api';

function* fetchNamespaceSaga({ payload }) {
  yield put(FETCH_NAMESPACE_REQUEST());
  try {
    const data = yield call(getNamespace, payload);
    yield put(FETCH_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACE_ERROR({ error: error.message }));
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(fetchNamespace, fetchNamespaceSaga),
  ]);
}
