import { takeEvery, call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit, formValueSelector } from 'redux-form';

import {
  fetchAccountInfo,
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
  selectAccount,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
  UPDATE_ROLE_FOR_NAMESPACE_SUCCESS,
} from '../modules/editAccount';

import {
  getAccountById,
  getNamespaces,
  getRegistries,
  addRoleForNamespace,
  removeRoleForNamespace,
} from '../lib/api';

export function* fetchAccountInfoSaga({ payload = {} }) {
  const { accountId, ...options } = payload;

  yield put(FETCH_ACCOUNT_REQUEST());
  try {
    const data = yield call(getAccountById, accountId);
    yield put(FETCH_ACCOUNT_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNT_ERROR({ error: error.message }));
  }
}

export function* fetchNamespacesSaga({ payload: options }) {
  yield put(FETCH_NAMESPACES_REQUEST());
  try {
    const data = yield call(getNamespaces);
    yield put(FETCH_NAMESPACES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACES_ERROR({ error: error.message }));
  }
}

export function* fetchRegistriesSaga({ payload: options }) {
  yield put(FETCH_REGISTRIES_REQUEST());
  try {
    const data = yield call(getRegistries);
    yield put(FETCH_REGISTRIES_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_REGISTRIES_ERROR({ error: error.message }));
  }
}

export function* updateRolesForNamespaceSaga({ payload }) {
  const { namespaceId, role, newValue, ...options } = payload;
  const { id: accountId } = yield select(selectAccount);
  yield put(startSubmit('accountNamespacesRoles'));
  try {
    let data;
    if (newValue) data = yield call(addRoleForNamespace, accountId, namespaceId, role, options);
    else data = yield call(removeRoleForNamespace, accountId, namespaceId, role, options);
    yield put(UPDATE_ROLE_FOR_NAMESPACE_SUCCESS({ data }));
    yield put(stopSubmit('accountNamespacesRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('accountNamespacesRoles'));
  }
}

export function* addNewNamespaceSaga({ payload = {} }) {
  const {
    newNamespace,
    roleForNewNamespace,
  } = yield select(formValueSelector('accountNamespacesRoles'), 'newNamespace', 'roleForNewNamespace');

  if (!newNamespace || !roleForNewNamespace) return;

  yield put(updateRolesForNamespace({
    namespaceId: newNamespace,
    role: roleForNewNamespace,
    newValue: true,
    ...payload,
  }));
}

export function* deleteRolesForNamespaceSaga({ payload }) {
  const { namespaceId, ...options } = payload;
  const roles = yield select(formValueSelector('accountNamespacesRoles'), namespaceId);
  for (const role in roles) {
    yield call(updateRolesForNamespaceSaga, { payload : {
      namespaceId,
      role,
      newValue: false,
      ...options,
    } });
  }
}

export default [
  takeEvery(fetchAccountInfo, fetchAccountInfoSaga),
  takeEvery(fetchAccountInfo, fetchNamespacesSaga),
  takeEvery(fetchAccountInfo, fetchRegistriesSaga),
  takeEvery(updateRolesForNamespace, updateRolesForNamespaceSaga),
  takeEvery(addNewNamespace, addNewNamespaceSaga),
  takeEvery(deleteRolesForNamespace, deleteRolesForNamespaceSaga),
];
