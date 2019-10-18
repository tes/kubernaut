import { call, put, select, take } from 'redux-saga/effects';
import { startSubmit, stopSubmit, reset } from 'redux-form';

import {
  fetchTeamInfoSaga,
  fetchNamespacesSaga,
  fetchRegistriesSaga,
  fetchTeamsSaga,
  updateRolesForNamespaceSaga,
  addNewNamespaceSaga,
  deleteRolesForNamespaceSaga,
  updateRolesForRegistrySaga,
  addNewRegistrySaga,
  deleteRolesForRegistrySaga,
  updateRolesForTeamSaga,
  addNewTeamSaga,
  deleteRolesForTeamSaga,
  checkPermissionSaga,
  fetchSystemRolesSaga,
  updateSystemRoleSaga,
  updateGlobalRoleSaga,
} from '../editTeam';

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
} from '../../modules/editTeam';

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
} from '../../lib/api';

const quietOptions = { quiet: true };

describe('editTeam sagas', () => {
  describe('fetchTeamInfoSaga', () => {
    it('should fetch and succeed at getting account data', () => {
      const data = { a: 1 };
      const team = 'abcdef';
      const match = { params: { team } };
      const gen = fetchTeamInfoSaga(fetchTeamInfo({ match }));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAM_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamByName, team));
      expect(gen.next(data).value).toMatchObject(put(FETCH_TEAM_SUCCESS({ data })));
      expect(gen.next().done).toBe(true);
    });

    it('should handle errors', () => {
      const team = 'abcdef';
      const match = { params: { team } };
      const error = new Error('ouch');
      const gen = fetchTeamInfoSaga(fetchTeamInfo({ ...quietOptions, match }));
      expect(gen.next().value).toMatchObject(put(FETCH_TEAM_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamByName, team));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAM_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetchSystemRolesSaga', () => {
    it('should fetch system roles', () => {
      const teamId = '123';
      const team = { id: teamId };
      const rolesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchSystemRolesSaga(fetchTeamInfo());
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(put(FETCH_SYSTEM_ROLES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamSystemRoles, teamId));
      expect(gen.next(rolesData).value).toMatchObject(put(FETCH_SYSTEM_ROLES_SUCCESS({ rolesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching system roles', () => {
      const teamId = '123';
      const team = { id: teamId };
      const error = new Error('ouch');
      const gen = fetchSystemRolesSaga(fetchTeamInfo({ ...quietOptions }));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(put(FETCH_SYSTEM_ROLES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamSystemRoles, teamId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_SYSTEM_ROLES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetchNamespacesSaga', () => {
    it('should fetch namespaces', () => {
      const teamId = '123';
      const team = { id: teamId };
      const namespacesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchNamespacesSaga(fetchTeamInfo());
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamRolesForNamespaces, teamId));
      expect(gen.next(namespacesData).value).toMatchObject(put(FETCH_NAMESPACES_SUCCESS({ rolesData: namespacesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching namespaces', () => {
      const teamId = '123';
      const team = { id: teamId };
      const error = new Error('ouch');
      const gen = fetchNamespacesSaga(fetchTeamInfo({ ...quietOptions }));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(put(FETCH_NAMESPACES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamRolesForNamespaces, teamId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_NAMESPACES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetchRegistriesSaga', () => {
    it('should fetch registries', () => {
      const teamId = '123';
      const team = { id: teamId };
      const registriesData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchRegistriesSaga(fetchTeamInfo());
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamRolesForRegistries, teamId));
      expect(gen.next(registriesData).value).toMatchObject(put(FETCH_REGISTRIES_SUCCESS({ rolesData: registriesData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching registries', () => {
      const teamId = '123';
      const team = { id: teamId };
      const error = new Error('ouch');
      const gen = fetchRegistriesSaga(fetchTeamInfo({ ...quietOptions }));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(put(FETCH_REGISTRIES_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamRolesForRegistries, teamId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_REGISTRIES_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('fetchTeamsSaga', () => {
    it('should fetch teams', () => {
      const teamId = '123';
      const team = { id: teamId };
      const teamsData = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };

      const gen = fetchTeamsSaga(fetchTeamInfo());
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamRolesForTeams, teamId));
      expect(gen.next(teamsData).value).toMatchObject(put(FETCH_TEAMS_SUCCESS({ rolesData: teamsData } )));
      expect(gen.next().done).toBe(true);
    });

    it('should tolerate errors fetching teams', () => {
      const teamId = '123';
      const team = { id: teamId };
      const error = new Error('ouch');
      const gen = fetchTeamsSaga(fetchTeamInfo({ ...quietOptions }));
      expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next(team).value).toMatchObject(put(FETCH_TEAMS_REQUEST()));
      expect(gen.next().value).toMatchObject(call(getTeamRolesForTeams, teamId));
      expect(gen.throw(error).value).toMatchObject(put(FETCH_TEAMS_ERROR({ error: error.message })));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('updateRolesForNamespaceSaga', () => {
    it('should add a role to a namespace', () => {
      const namespaceId = 'abc';
      const role = 'bob';
      const teamId = '123';
      const teamData = { a: 1 };
      const gen = updateRolesForNamespaceSaga(updateRolesForNamespace({
        namespaceId,
        teamId,
        role,
        newValue: true,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamNamespacesRoles')));
      expect(gen.next().value).toMatchObject(call(addTeamRoleForNamespace, teamId, namespaceId, role, { quiet: true}));
      expect(gen.next(teamData).value).toMatchObject(put(UPDATE_ROLE_FOR_NAMESPACE_SUCCESS({ data: teamData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamNamespacesRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should remove a role to a namespace', () => {
      const namespaceId = 'abc';
      const role = 'bob';
      const teamId = '123';
      const teamData = { a: 1 };
      const gen = updateRolesForNamespaceSaga(updateRolesForNamespace({
        namespaceId,
        teamId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamNamespacesRoles')));
      expect(gen.next().value).toMatchObject(call(removeTeamRoleForNamespace, teamId, namespaceId, role, { quiet: true}));
      expect(gen.next(teamData).value).toMatchObject(put(UPDATE_ROLE_FOR_NAMESPACE_SUCCESS({ data: teamData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamNamespacesRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should handle an error', () => {
      const namespaceId = 'abc';
      const role = 'bob';
      const teamId = '123';
      const gen = updateRolesForNamespaceSaga(updateRolesForNamespace({
        namespaceId,
        teamId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamNamespacesRoles')));
      expect(gen.next().value).toMatchObject(call(removeTeamRoleForNamespace, teamId, namespaceId, role, { quiet: true}));
      expect(gen.throw(new Error('ouch')).value).toMatchObject(put(stopSubmit('teamNamespacesRoles')));
      expect(gen.next().value).toMatchObject(put(reset('teamNamespacesRoles')));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('updateRolesForRegistrySaga', () => {
    it('should add a role to a registry', () => {
      const registryId = 'abc';
      const role = 'bob';
      const teamId = '123';
      const teamData = { a: 1 };
      const gen = updateRolesForRegistrySaga(updateRolesForRegistry({
        registryId,
        teamId,
        role,
        newValue: true,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamRegistriesRoles')));
      expect(gen.next().value).toMatchObject(call(addTeamRoleForRegistry, teamId, registryId, role, { quiet: true}));
      expect(gen.next(teamData).value).toMatchObject(put(UPDATE_ROLE_FOR_REGISTRY_SUCCESS({ data: teamData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamRegistriesRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should remove a role to a registry', () => {
      const registryId = 'abc';
      const role = 'bob';
      const teamId = '123';
      const teamData = { a: 1 };
      const gen = updateRolesForRegistrySaga(updateRolesForRegistry({
        registryId,
        teamId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamRegistriesRoles')));
      expect(gen.next().value).toMatchObject(call(removeTeamRoleForRegistry, teamId, registryId, role, { quiet: true}));
      expect(gen.next(teamData).value).toMatchObject(put(UPDATE_ROLE_FOR_REGISTRY_SUCCESS({ data: teamData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamRegistriesRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should handle an error', () => {
      const registryId = 'abc';
      const role = 'bob';
      const teamId = '123';
      const gen = updateRolesForRegistrySaga(updateRolesForRegistry({
        registryId,
        teamId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamRegistriesRoles')));
      expect(gen.next().value).toMatchObject(call(removeTeamRoleForRegistry, teamId, registryId, role, { quiet: true}));
      expect(gen.throw(new Error('ouch')).value).toMatchObject(put(stopSubmit('teamRegistriesRoles')));
      expect(gen.next().value).toMatchObject(put(reset('teamRegistriesRoles')));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('updateRolesForTeamSaga', () => {
    it('should add a role to a team', () => {
      const teamId = 'abc';
      const role = 'bob';
      const subjectTeamId = '123';
      const teamData = { a: 1 };
      const gen = updateRolesForTeamSaga(updateRolesForTeam({
        teamId: subjectTeamId,
        role,
        newValue: true,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamTeamsRoles')));
      expect(gen.next().value).toMatchObject(call(addTeamRoleForTeam, teamId, subjectTeamId, role, { quiet: true}));
      expect(gen.next(teamData).value).toMatchObject(put(UPDATE_ROLE_FOR_TEAM_SUCCESS({ data: teamData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamTeamsRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should remove a role to a team', () => {
      const teamId = 'abc';
      const role = 'bob';
      const subjectTeamId = '123';
      const teamData = { a: 1 };
      const gen = updateRolesForTeamSaga(updateRolesForTeam({
        teamId: subjectTeamId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamTeamsRoles')));
      expect(gen.next().value).toMatchObject(call(removeTeamRoleForTeam, teamId, subjectTeamId, role, { quiet: true}));
      expect(gen.next(teamData).value).toMatchObject(put(UPDATE_ROLE_FOR_TEAM_SUCCESS({ data: teamData })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamTeamsRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('should handle an error', () => {
      const teamId = 'abc';
      const role = 'bob';
      const subjectTeamId = '123';
      const gen = updateRolesForTeamSaga(updateRolesForTeam({
        teamId: subjectTeamId,
        role,
        newValue: false,
        quiet: true,
      }));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamTeamsRoles')));
      expect(gen.next().value).toMatchObject(call(removeTeamRoleForTeam, teamId, subjectTeamId, role, { quiet: true}));
      expect(gen.throw(new Error('ouch')).value).toMatchObject(put(stopSubmit('teamTeamsRoles')));
      expect(gen.next().value).toMatchObject(put(reset('teamTeamsRoles')));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('addNewNamespaceSaga', () => {
    it('add a new namespace and role', () => {
      const namespaceId = 'abc';
      const role = 'bob';

      const gen = addNewNamespaceSaga(addNewNamespace());
      gen.next(); // form selector
      expect(gen.next({ newNamespace: namespaceId, roleForNewNamespace: role }).value).toMatchObject(put(updateRolesForNamespace({
        namespaceId,
        role,
        newValue: true,
      })));
      expect(gen.next().done).toBe(true);
    });

    it('add returns when missing namespace', () => {
      const gen = addNewNamespaceSaga(addNewNamespace());
      gen.next(); // form selector
      expect(gen.next({ roleForNewNamespace: 'bob' }).done).toBe(true);
    });

    it('add returns when missing role', () => {
      const gen = addNewNamespaceSaga(addNewNamespace());
      gen.next(); // form selector
      expect(gen.next({ newNamespace: 'bob' }).done).toBe(true);
    });
  });

  describe('addNewRegistrySaga', () => {
    it('add a new registry and role', () => {
      const registryId = 'abc';
      const role = 'bob';

      const gen = addNewRegistrySaga(addNewRegistry());
      gen.next(); // form selector
      expect(gen.next({ newRegistry: registryId, roleForNewRegistry: role }).value).toMatchObject(put(updateRolesForRegistry({
        registryId,
        role,
        newValue: true,
      })));
      expect(gen.next().done).toBe(true);
    });

    it('add returns when missing registry', () => {
      const gen = addNewRegistrySaga(addNewRegistry());
      gen.next(); // form selector
      expect(gen.next({ roleForNewRegistry: 'bob' }).done).toBe(true);
    });

    it('add returns when missing role', () => {
      const gen = addNewRegistrySaga(addNewRegistry());
      gen.next(); // form selector
      expect(gen.next({ newRegistry: 'bob' }).done).toBe(true);
    });
  });

  describe('addNewTeamSaga', () => {
    it('add a new team and role', () => {
      const teamId = 'abc';
      const role = 'bob';

      const gen = addNewTeamSaga(addNewTeam());
      gen.next(); // form selector
      expect(gen.next({ newTeam: teamId, roleForNewTeam: role }).value).toMatchObject(put(updateRolesForTeam({
        teamId,
        role,
        newValue: true,
      })));
      expect(gen.next().done).toBe(true);
    });

    it('add returns when missing team', () => {
      const gen = addNewTeamSaga(addNewTeam());
      gen.next(); // form selector
      expect(gen.next({ roleForNewTeam: 'bob' }).done).toBe(true);
    });

    it('add returns when missing role', () => {
      const gen = addNewTeamSaga(addNewTeam());
      gen.next(); // form selector
      expect(gen.next({ newTeam: 'bob' }).done).toBe(true);
    });
  });

  describe('deleteRolesForNamespaceSaga', () => {
    it('deletes all roles for a namespace', () => {
      const namespaceId = 'abc';
      const gen = deleteRolesForNamespaceSaga(deleteRolesForNamespace({ namespaceId }));
      gen.next(); //Form selector
      expect(gen.next({ a: true, b: true }).value).toMatchObject(call(updateRolesForNamespaceSaga, { payload: {
        namespaceId,
        role: 'a',
        newValue: false,
      } }));
      expect(gen.next().value).toMatchObject(call(updateRolesForNamespaceSaga, { payload: {
        namespaceId,
        role: 'b',
        newValue: false,
      } }));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('deleteRolesForRegistrySaga', () => {
    it('deletes all roles for a registry', () => {
      const registryId = 'abc';
      const gen = deleteRolesForRegistrySaga(deleteRolesForRegistry({ registryId }));
      gen.next(); //Form selector
      expect(gen.next({ a: true, b: true }).value).toMatchObject(call(updateRolesForRegistrySaga, { payload: {
        registryId,
        role: 'a',
        newValue: false,
      } }));
      expect(gen.next().value).toMatchObject(call(updateRolesForRegistrySaga, { payload: {
        registryId,
        role: 'b',
        newValue: false,
      } }));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('deleteRolesForTeamSaga', () => {
    it('deletes all roles for a registry', () => {
      const teamId = 'abc';
      const gen = deleteRolesForTeamSaga(deleteRolesForTeam({ teamId }));
      gen.next(); //Form selector
      expect(gen.next({ a: true, b: true }).value).toMatchObject(call(updateRolesForTeamSaga, { payload: {
        teamId,
        role: 'a',
        newValue: false,
      } }));
      expect(gen.next().value).toMatchObject(call(updateRolesForTeamSaga, { payload: {
        teamId,
        role: 'b',
        newValue: false,
      } }));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('updateSystemRoleSaga', () => {
    it('grants a system role', () => {
      const role = 'developer';
      const value = true;
      const teamId = 'abc123';
      const payload = { role, newValue: value };
      const updateResult = { bob: 1 };

      const gen = updateSystemRoleSaga(updateSystemRole(payload));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamSystemRoles')));
      expect(gen.next().value).toMatchObject(call(addTeamRoleForSystem, teamId, role, {}));
      expect(gen.next(updateResult).value).toMatchObject(put(UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data: updateResult })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamSystemRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('revokes a system role', () => {
      const role = 'developer';
      const value = false;
      const teamId = 'abc123';
      const payload = { role, newValue: value };
      const updateResult = { bob: 1 };

      const gen = updateSystemRoleSaga(updateSystemRole(payload));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamSystemRoles')));
      expect(gen.next().value).toMatchObject(call(removeTeamRoleForSystem, teamId, role, {}));
      expect(gen.next(updateResult).value).toMatchObject(put(UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data: updateResult })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamSystemRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('handle an error', () => {
      const role = 'developer';
      const value = true;
      const teamId = 'abc123';
      const payload = { role, newValue: value, quiet: true };

      const gen = updateSystemRoleSaga(updateSystemRole(payload));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamSystemRoles')));
      expect(gen.next().value).toMatchObject(call(addTeamRoleForSystem, teamId, role, {}));
      expect(gen.throw(new Error('bob')).value).toMatchObject(put(stopSubmit('teamSystemRoles')));
      expect(gen.next().value).toMatchObject(put(reset('teamSystemRoles')));
      expect(gen.next().done).toBe(true);
    });
  });

  describe('updateGlobalRoleSaga', () => {
    it('grants a system role', () => {
      const role = 'developer';
      const value = true;
      const teamId = 'abc123';
      const payload = { role, newValue: value };
      const updateResult = { bob: 1 };

      const gen = updateGlobalRoleSaga(updateGlobalRole(payload));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamSystemRoles')));
      expect(gen.next().value).toMatchObject(call(addTeamGlobalRole, teamId, role, {}));
      expect(gen.next(updateResult).value).toMatchObject(put(UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data: updateResult })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamSystemRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('revokes a system role', () => {
      const role = 'developer';
      const value = false;
      const teamId = 'abc123';
      const payload = { role, newValue: value };
      const updateResult = { bob: 1 };

      const gen = updateGlobalRoleSaga(updateGlobalRole(payload));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamSystemRoles')));
      expect(gen.next().value).toMatchObject(call(removeTeamGlobalRole, teamId, role, {}));
      expect(gen.next(updateResult).value).toMatchObject(put(UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data: updateResult })));
      expect(gen.next().value).toMatchObject(put(stopSubmit('teamSystemRoles')));
      expect(gen.next().done).toBe(true);
    });

    it('handle an error', () => {
      const role = 'developer';
      const value = true;
      const teamId = 'abc123';
      const payload = { role, newValue: value, quiet: true };

      const gen = updateGlobalRoleSaga(updateGlobalRole(payload));
      expect(gen.next().value).toMatchObject(select(selectTeam));
      expect(gen.next({ id: teamId }).value).toMatchObject(put(startSubmit('teamSystemRoles')));
      expect(gen.next().value).toMatchObject(call(addTeamGlobalRole, teamId, role, {}));
      expect(gen.throw(new Error('bob')).value).toMatchObject(put(stopSubmit('teamSystemRoles')));
      expect(gen.next().value).toMatchObject(put(reset('teamSystemRoles')));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should check permission', () => {
    const team = { id: '123' };

    const gen = checkPermissionSaga(fetchTeamInfo());
    expect(gen.next().value).toMatchObject(take(FETCH_TEAM_SUCCESS));
    expect(gen.next().value).toMatchObject(select(selectTeam));
    expect(gen.next(team).value).toMatchObject(call(hasPermissionOn, 'teams-manage', 'team', team.id));
    expect(gen.next({ answer: true }).value).toMatchObject(put(setCanEdit(true)));
    expect(gen.next().done).toBe(true);
  });
});
