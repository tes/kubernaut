import { all, takeEvery, call, put } from 'redux-saga/effects';
import {
  fetchNamespacePageData,
  FETCH_NAMESPACE_REQUEST,
  FETCH_NAMESPACE_SUCCESS,
  FETCH_NAMESPACE_ERROR,
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../modules/namespace';
import { getNamespace, fetchDeployments } from '../lib/api';

function* fetchNamespaceInfoSaga({ payload }) {
  yield put(FETCH_NAMESPACE_REQUEST());
  try {
    const data = yield call(getNamespace, payload);
    yield put(FETCH_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACE_ERROR({ error: error.message }));
  }
}

function* fetchDeploymentsForNamespaceSaga({ payload }) {
  yield put(FETCH_DEPLOYMENTS_REQUEST());
  try {
    const data = yield call(fetchDeployments, { namespace: payload });
    yield put(FETCH_DEPLOYMENTS_SUCCESS({ data }));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
    yield put(FETCH_DEPLOYMENTS_ERROR({ error: error.message }));
  }
}

export default function* rootSaga() {
  yield all([
    takeEvery(fetchNamespacePageData, fetchNamespaceInfoSaga),
    takeEvery(fetchNamespacePageData, fetchDeploymentsForNamespaceSaga),
  ]);
}
