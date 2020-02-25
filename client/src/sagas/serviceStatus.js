import { takeLatest, call, put, select, take } from 'redux-saga/effects';
import { push, replace } from 'connected-react-router';

import {
  initServiceStatusPage,
  fetchLatestDeployments,
  fetchStatus,
  setCanManage,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS,
  FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR,
  FETCH_STATUS_REQUEST,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_ERROR,
  fetchTeamForService,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  selectLatestDeployments,
  changeToNamespace,
} from '../modules/serviceStatus';

import {
  getLatestDeploymentsByNamespaceForService,
  getCanManageAnyNamespace,
  getTeamForService,
  getStatusForService,
} from '../lib/api';

export function* initServiceStatusPageSaga({ payload = {} }) {
  const { match, location } = payload;
  if (!match || !location) return;
  const { registry, name: service, namespaceId } = match.params;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');

  if (!namespaceId) {
    yield put(fetchLatestDeployments({ registry, service }));
    yield take(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS);
    const namespaces = yield select(selectLatestDeployments);
    if (namespaces && namespaces.length) {
      const toGoto = namespaces[0];
      yield put(replace(`${location.pathname}/${toGoto.id}`));
      return;
    }
  }

  yield put(fetchLatestDeployments({ registry, service }));
  yield put(fetchStatus({ registry, service, namespaceId }));
}

export function* fetchLatestDeploymentsByNamespaceForServiceSaga({ payload = {} }) {
  const { registry, service, ...options } = payload;
  if (!registry) throw new Error('provide a registry');
  if (!service) throw new Error('provide a service');

  const quiet = options.quiet;
  yield put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_REQUEST());

  try {
    const data = yield call(getLatestDeploymentsByNamespaceForService, {
      registry,
      service,
      includeFailed: true,
    });
    yield put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_SUCCESS({ data }));
  } catch(error) {
    if (!quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_LATEST_DEPLOYMENTS_BY_NAMESPACE_ERROR({ error: error.message }));
  }
}

export function* canManageSaga() {
  try {
    const canManage = yield call(getCanManageAnyNamespace);
    yield put(setCanManage(canManage.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchTeamForServiceSaga({ payload = {} }) {
  const { registry, service } = payload;
  try {
    yield put(FETCH_TEAM_REQUEST());
    const data = yield call(getTeamForService, { registry, service });
    yield put(FETCH_TEAM_SUCCESS({ data }));
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export function* fetchStatusSaga({ payload = {} }) {
  const { registry, service, namespaceId, quiet } = payload;
  try {
    yield put(FETCH_STATUS_REQUEST());
    const data = yield call(getStatusForService, { registry, service, namespaceId });
    yield put(FETCH_STATUS_SUCCESS({ data }));
  } catch (error) {
    if (!quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_STATUS_ERROR());
  }
}

export function* changeToNamespaceSaga({ payload = {} }) {
  const { namespaceId, registry, service} = payload;
  yield put(push(`/services/${registry}/${service}/status/${namespaceId}`));
}

export default [
  takeLatest(initServiceStatusPage, initServiceStatusPageSaga),
  takeLatest(initServiceStatusPage, canManageSaga),
  takeLatest(fetchLatestDeployments, fetchLatestDeploymentsByNamespaceForServiceSaga),
  takeLatest(fetchTeamForService, fetchTeamForServiceSaga),
  takeLatest(fetchStatus, fetchStatusSaga),
  takeLatest(changeToNamespace, changeToNamespaceSaga),
];
