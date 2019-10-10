import { takeEvery, takeLatest, call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit, reset, formValueSelector } from 'redux-form';

import {
  fetchAccountInfo,
  updateRolesForNamespace,
  addNewNamespace,
  deleteRolesForNamespace,
  updateRolesForTeam,
  addNewTeam,
  deleteRolesForTeam,
  deleteRolesForRegistry,
  updateRolesForRegistry,
  updateSystemRole,
  updateGlobalRole,
  addNewRegistry,
  selectAccount,
  setCanEdit,
  setCanManageTeam,
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
  FETCH_SYSTEM_ROLES_REQUEST,
  FETCH_SYSTEM_ROLES_SUCCESS,
  FETCH_SYSTEM_ROLES_ERROR,
  UPDATE_ROLE_FOR_NAMESPACE_SUCCESS,
  UPDATE_ROLE_FOR_REGISTRY_SUCCESS,
  UPDATE_ROLE_FOR_SYSTEM_SUCCESS,
  UPDATE_ROLE_FOR_TEAM_SUCCESS,
} from '../modules/editAccount';

import {
  getAccountById,
  addRoleForNamespace,
  removeRoleForNamespace,
  addRoleForRegistry,
  removeRoleForRegistry,
  addRoleForTeam,
  removeRoleForTeam,
  hasPermission,
  getAccountRolesForNamesaces,
  getAccountRolesForRegistries,
  getAccountRolesForTeams,
  getSystemRoles,
  addRoleForSystem,
  removeRoleForSystem,
  addGlobalRole,
  removeGlobalRole,
  getCanManageAnyTeam,
} from '../lib/api';

export function* fetchAccountInfoSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { accountId } = match.params;
  if (!accountId) return;

  yield put(FETCH_ACCOUNT_REQUEST());
  try {
    const data = yield call(getAccountById, accountId);
    yield put(FETCH_ACCOUNT_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_ACCOUNT_ERROR({ error: error.message }));
  }
}

export function* fetchNamespacesSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { accountId } = match.params;
  if (!accountId) return;

  yield put(FETCH_NAMESPACES_REQUEST());
  try {
    const rolesData = yield call(getAccountRolesForNamesaces, accountId);
    yield put(FETCH_NAMESPACES_SUCCESS({ rolesData }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACES_ERROR({ error: error.message }));
  }
}

export function* fetchRegistriesSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { accountId } = match.params;
  if (!accountId) return;

  yield put(FETCH_REGISTRIES_REQUEST());
  try {
    const rolesData = yield call(getAccountRolesForRegistries, accountId);
    yield put(FETCH_REGISTRIES_SUCCESS({ rolesData }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_REGISTRIES_ERROR({ error: error.message }));
  }
}

export function* fetchTeamsSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { accountId } = match.params;
  if (!accountId) return;

  yield put(FETCH_TEAMS_REQUEST());
  try {
    const rolesData = yield call(getAccountRolesForTeams, accountId);
    yield put(FETCH_TEAMS_SUCCESS({ rolesData }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAMS_ERROR({ error: error.message }));
  }
}

export function* fetchSystemRolesSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { accountId } = match.params;
  if (!accountId) return;

  yield put(FETCH_SYSTEM_ROLES_REQUEST());
  try {
    const rolesData = yield call(getSystemRoles, accountId);
    yield put(FETCH_SYSTEM_ROLES_SUCCESS({ rolesData }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SYSTEM_ROLES_ERROR({ error: error.message }));
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
    yield put(reset('accountNamespacesRoles'));
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

export function* updateRolesForRegistrySaga({ payload }) {
  const { registryId, role, newValue, ...options } = payload;
  const { id: accountId } = yield select(selectAccount);
  yield put(startSubmit('accountRegistriesRoles'));
  try {
    let data;
    if (newValue) data = yield call(addRoleForRegistry, accountId, registryId, role, options);
    else data = yield call(removeRoleForRegistry, accountId, registryId, role, options);
    yield put(UPDATE_ROLE_FOR_REGISTRY_SUCCESS({ data }));
    yield put(stopSubmit('accountRegistriesRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('accountRegistriesRoles'));
    yield put(reset('accountRegistriesRoles'));
  }
}

export function* updateSystemRoleSaga({ payload }) {
  const { role, newValue, ...options } = payload;
  const { id: accountId } = yield select(selectAccount);
  yield put(startSubmit('accountSystemRoles'));
  try {
    let data;
    if (newValue) data = yield call(addRoleForSystem, accountId, role, options);
    else data = yield call(removeRoleForSystem, accountId, role, options);
    yield put(UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data }));
    yield put(stopSubmit('accountSystemRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('accountSystemRoles'));
    yield put(reset('accountSystemRoles'));
  }
}

export function* updateGlobalRoleSaga({ payload }) {
  const { role, newValue, ...options } = payload;
  const { id: accountId } = yield select(selectAccount);
  yield put(startSubmit('accountSystemRoles'));
  try {
    let data;
    if (newValue) data = yield call(addGlobalRole, accountId, role, options);
    else data = yield call(removeGlobalRole, accountId, role, options);
    yield put(UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data }));
    yield put(stopSubmit('accountSystemRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('accountSystemRoles'));
    yield put(reset('accountSystemRoles'));
  }
}

export function* addNewRegistrySaga({ payload = {} }) {
  const {
    newRegistry,
    roleForNewRegistry,
  } = yield select(formValueSelector('accountRegistriesRoles'), 'newRegistry', 'roleForNewRegistry');

  if (!newRegistry || !roleForNewRegistry) return;

  yield put(updateRolesForRegistry({
    registryId: newRegistry,
    role: roleForNewRegistry,
    newValue: true,
    ...payload,
  }));
}

export function* deleteRolesForRegistrySaga({ payload }) {
  const { registryId, ...options } = payload;
  const roles = yield select(formValueSelector('accountRegistriesRoles'), registryId);
  for (const role in roles) {
    yield call(updateRolesForRegistrySaga, { payload : {
      registryId,
      role,
      newValue: false,
      ...options,
    } });
  }
}

export function* updateRolesForTeamSaga({ payload }) {
  const { teamId, role, newValue, ...options } = payload;
  const { id: accountId } = yield select(selectAccount);
  yield put(startSubmit('accountTeamsRoles'));
  try {
    let data;
    if (newValue) data = yield call(addRoleForTeam, accountId, teamId, role, options);
    else data = yield call(removeRoleForTeam, accountId, teamId, role, options);
    yield put(UPDATE_ROLE_FOR_TEAM_SUCCESS({ data }));
    yield put(stopSubmit('accountTeamsRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('accountTeamsRoles'));
    yield put(reset('accountTeamsRoles'));
  }
}

export function* addNewTeamSaga({ payload = {} }) {
  const {
    newTeam,
    roleForNewTeam,
  } = yield select(formValueSelector('accountTeamsRoles'), 'newTeam', 'roleForNewTeam');

  if (!newTeam || !roleForNewTeam) return;

  yield put(updateRolesForTeam({
    teamId: newTeam,
    role: roleForNewTeam,
    newValue: true,
    ...payload,
  }));
}

export function* deleteRolesForTeamSaga({ payload }) {
  const { teamId, ...options } = payload;
  const roles = yield select(formValueSelector('accountTeamsRoles'), teamId);
  for (const role in roles) {
    yield call(updateRolesForTeamSaga, { payload : {
      teamId,
      role,
      newValue: false,
      ...options,
    } });
  }
}

export function* checkPermissionSaga({ payload = {}}) {
  try {
    const editResult = yield call(hasPermission, 'accounts-write');
    yield put(setCanEdit(editResult.answer));
    const manageTeamResult = yield call(getCanManageAnyTeam);
    yield put(setCanManageTeam(manageTeamResult.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(fetchAccountInfo, fetchAccountInfoSaga),
  takeLatest(fetchAccountInfo, fetchNamespacesSaga),
  takeLatest(fetchAccountInfo, fetchRegistriesSaga),
  takeLatest(fetchAccountInfo, fetchTeamsSaga),
  takeLatest(fetchAccountInfo, fetchSystemRolesSaga),
  takeLatest(fetchAccountInfo, checkPermissionSaga),
  takeEvery(updateRolesForNamespace, updateRolesForNamespaceSaga),
  takeEvery(addNewNamespace, addNewNamespaceSaga),
  takeEvery(deleteRolesForNamespace, deleteRolesForNamespaceSaga),
  takeEvery(updateRolesForRegistry, updateRolesForRegistrySaga),
  takeEvery(addNewRegistry, addNewRegistrySaga),
  takeEvery(deleteRolesForRegistry, deleteRolesForRegistrySaga),
  takeEvery(updateRolesForTeam, updateRolesForTeamSaga),
  takeEvery(addNewTeam, addNewTeamSaga),
  takeEvery(deleteRolesForTeam, deleteRolesForTeamSaga),
  takeEvery(updateSystemRole, updateSystemRoleSaga),
  takeEvery(updateGlobalRole, updateGlobalRoleSaga),
];
