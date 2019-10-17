import { takeEvery, takeLatest, take, call, put, select } from 'redux-saga/effects';
import { startSubmit, stopSubmit, reset, formValueSelector } from 'redux-form';

import {
  fetchTeamInfo,
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
  selectTeam,
  setCanEdit,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
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
} from '../modules/editTeam';

import {
  getTeamByName,
  addTeamRoleForNamespace,
  removeTeamRoleForNamespace,
  addTeamRoleForRegistry,
  removeTeamRoleForRegistry,
  addTeamRoleForTeam,
  removeTeamRoleForTeam,
  hasPermissionOn,
  getTeamRolesForNamespaces,
  getTeamRolesForRegistries,
  getTeamRolesForTeams,
  getTeamSystemRoles,
  addTeamRoleForSystem,
  removeTeamRoleForSystem,
  addTeamGlobalRole,
  removeTeamGlobalRole,
} from '../lib/api';

export function* fetchTeamInfoSaga({ payload = {} }) {
  const { match, ...options } = payload;
  if (!match) return;
  const { team } = match.params;
  if (!team) return;

  yield put(FETCH_TEAM_REQUEST());
  try {
    const data = yield call(getTeamByName, team);
    yield put(FETCH_TEAM_SUCCESS({ data }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAM_ERROR({ error: error.message }));
  }
}

export function* fetchNamespacesSaga({ payload = {} }) {
  const { ...options } = payload;
  yield take(FETCH_TEAM_SUCCESS);
  const team = yield select(selectTeam);

  yield put(FETCH_NAMESPACES_REQUEST());
  try {
    const rolesData = yield call(getTeamRolesForNamespaces, team.id);
    yield put(FETCH_NAMESPACES_SUCCESS({ rolesData }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_NAMESPACES_ERROR({ error: error.message }));
  }
}

export function* fetchRegistriesSaga({ payload = {} }) {
  const { ...options } = payload;
  yield take(FETCH_TEAM_SUCCESS);
  const team = yield select(selectTeam);

  yield put(FETCH_REGISTRIES_REQUEST());
  try {
    const rolesData = yield call(getTeamRolesForRegistries, team.id);
    yield put(FETCH_REGISTRIES_SUCCESS({ rolesData }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_REGISTRIES_ERROR({ error: error.message }));
  }
}

export function* fetchTeamsSaga({ payload = {} }) {
  const { ...options } = payload;
  yield take(FETCH_TEAM_SUCCESS);
  const team = yield select(selectTeam);

  yield put(FETCH_TEAMS_REQUEST());
  try {
    const rolesData = yield call(getTeamRolesForTeams, team.id);
    yield put(FETCH_TEAMS_SUCCESS({ rolesData }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_TEAMS_ERROR({ error: error.message }));
  }
}

export function* fetchSystemRolesSaga({ payload = {} }) {
  const { ...options } = payload;
  yield take(FETCH_TEAM_SUCCESS);
  const team = yield select(selectTeam);

  yield put(FETCH_SYSTEM_ROLES_REQUEST());
  try {
    const rolesData = yield call(getTeamSystemRoles, team.id);
    yield put(FETCH_SYSTEM_ROLES_SUCCESS({ rolesData }));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(FETCH_SYSTEM_ROLES_ERROR({ error: error.message }));
  }
}

export function* updateRolesForNamespaceSaga({ payload }) {
  const { namespaceId, role, newValue, ...options } = payload;
  const { id: teamId } = yield select(selectTeam);
  yield put(startSubmit('teamNamespacesRoles'));
  try {
    let data;
    if (newValue) data = yield call(addTeamRoleForNamespace, teamId, namespaceId, role, options);
    else data = yield call(removeTeamRoleForNamespace, teamId, namespaceId, role, options);
    yield put(UPDATE_ROLE_FOR_NAMESPACE_SUCCESS({ data }));
    yield put(stopSubmit('teamNamespacesRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('teamNamespacesRoles'));
    yield put(reset('teamNamespacesRoles'));
  }
}

export function* addNewNamespaceSaga({ payload = {} }) {
  const {
    newNamespace,
    roleForNewNamespace,
  } = yield select(formValueSelector('teamNamespacesRoles'), 'newNamespace', 'roleForNewNamespace');

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
  const roles = yield select(formValueSelector('teamNamespacesRoles'), namespaceId);
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
  const { id: teamId } = yield select(selectTeam);
  yield put(startSubmit('teamRegistriesRoles'));
  try {
    let data;
    if (newValue) data = yield call(addTeamRoleForRegistry, teamId, registryId, role, options);
    else data = yield call(removeTeamRoleForRegistry, teamId, registryId, role, options);
    yield put(UPDATE_ROLE_FOR_REGISTRY_SUCCESS({ data }));
    yield put(stopSubmit('teamRegistriesRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('teamRegistriesRoles'));
    yield put(reset('teamRegistriesRoles'));
  }
}

export function* updateSystemRoleSaga({ payload }) {
  const { role, newValue, ...options } = payload;
  const { id: teamId } = yield select(selectTeam);
  yield put(startSubmit('teamSystemRoles'));
  try {
    let data;
    if (newValue) data = yield call(addTeamRoleForSystem, teamId, role, options);
    else data = yield call(removeTeamRoleForSystem, teamId, role, options);
    yield put(UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data }));
    yield put(stopSubmit('teamSystemRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('teamSystemRoles'));
    yield put(reset('teamSystemRoles'));
  }
}

export function* updateGlobalRoleSaga({ payload }) {
  const { role, newValue, ...options } = payload;
  const { id: teamId } = yield select(selectTeam);
  yield put(startSubmit('teamSystemRoles'));
  try {
    let data;
    if (newValue) data = yield call(addTeamGlobalRole, teamId, role, options);
    else data = yield call(removeTeamGlobalRole, teamId, role, options);
    yield put(UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data }));
    yield put(stopSubmit('teamSystemRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('teamSystemRoles'));
    yield put(reset('teamSystemRoles'));
  }
}

export function* addNewRegistrySaga({ payload = {} }) {
  const {
    newRegistry,
    roleForNewRegistry,
  } = yield select(formValueSelector('teamRegistriesRoles'), 'newRegistry', 'roleForNewRegistry');

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
  const roles = yield select(formValueSelector('teamRegistriesRoles'), registryId);
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
  const { teamId: subjectTeamId, role, newValue, ...options } = payload;
  const { id: teamId } = yield select(selectTeam);
  yield put(startSubmit('teamTeamsRoles'));
  try {
    let data;
    if (newValue) data = yield call(addTeamRoleForTeam, teamId, subjectTeamId, role, options);
    else data = yield call(removeTeamRoleForTeam, teamId, subjectTeamId, role, options);
    yield put(UPDATE_ROLE_FOR_TEAM_SUCCESS({ data }));
    yield put(stopSubmit('teamTeamsRoles'));
  } catch(error) {
    if (!options.quiet) console.error(error); // eslint-disable-line no-console
    yield put(stopSubmit('teamTeamsRoles'));
    yield put(reset('teamTeamsRoles'));
  }
}

export function* addNewTeamSaga({ payload = {} }) {
  const {
    newTeam,
    roleForNewTeam,
  } = yield select(formValueSelector('teamTeamsRoles'), 'newTeam', 'roleForNewTeam');

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
  const roles = yield select(formValueSelector('teamTeamsRoles'), teamId);
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
    yield take(FETCH_TEAM_SUCCESS);
    const team = yield select(selectTeam);

    const editResult = yield call(hasPermissionOn, 'teams-manage', 'team', team.id);
    yield put(setCanEdit(editResult.answer));
  } catch(error) {
    console.error(error); // eslint-disable-line no-console
  }
}

export default [
  takeLatest(fetchTeamInfo, fetchTeamInfoSaga),
  takeLatest(fetchTeamInfo, fetchNamespacesSaga),
  takeLatest(fetchTeamInfo, fetchRegistriesSaga),
  takeLatest(fetchTeamInfo, fetchTeamsSaga),
  takeLatest(fetchTeamInfo, fetchSystemRolesSaga),
  takeLatest(fetchTeamInfo, checkPermissionSaga),
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
