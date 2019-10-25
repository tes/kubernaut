import { createAction, handleActions, combineActions } from 'redux-actions';
import computeLoading from './lib/computeLoading';

const actionsPrefix = `KUBERNAUT/EDIT_TEAM`;
export const fetchTeamInfo = createAction(`${actionsPrefix}/FETCH_TEAM_INFO`);
export const updateRolesForNamespace = createAction(`${actionsPrefix}/UPDATE_ROLES_FOR_NAMESPACE`);
export const addNewNamespace = createAction(`${actionsPrefix}/ADD_NEW_NAMESPACE`);
export const deleteRolesForNamespace = createAction(`${actionsPrefix}/DELETE_ROLES_FOR_NAMESPACE`);
export const updateRolesForRegistry = createAction(`${actionsPrefix}/UPDATE_ROLES_FOR_REGISTRY`);
export const addNewRegistry = createAction(`${actionsPrefix}/ADD_NEW_REGISTRY`);
export const deleteRolesForRegistry = createAction(`${actionsPrefix}/DELETE_ROLES_FOR_REGISTRY`);
export const updateRolesForTeam = createAction(`${actionsPrefix}/UPDATE_ROLES_FOR_TEAM`);
export const addNewTeam = createAction(`${actionsPrefix}/ADD_NEW_TEAM`);
export const deleteRolesForTeam = createAction(`${actionsPrefix}/DELETE_ROLES_FOR_TEAM`);
export const updateSystemRole = createAction(`${actionsPrefix}/UPDATE_SYSTEM_ROLE`);
export const updateGlobalRole = createAction(`${actionsPrefix}/UPDATE_GLOBAL_ROLE`);
export const FETCH_TEAM_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAM_REQUEST`);
export const FETCH_TEAM_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAM_SUCCESS`);
export const FETCH_TEAM_ERROR = createAction(`${actionsPrefix}/FETCH_TEAM_ERROR`);
export const FETCH_NAMESPACES_REQUEST = createAction(`${actionsPrefix}/FETCH_NAMESPACES_REQUEST`);
export const FETCH_NAMESPACES_SUCCESS = createAction(`${actionsPrefix}/FETCH_NAMESPACES_SUCCESS`);
export const FETCH_NAMESPACES_ERROR = createAction(`${actionsPrefix}/FETCH_NAMESPACES_ERROR`);
export const FETCH_REGISTRIES_REQUEST = createAction(`${actionsPrefix}/FETCH_REGISTRIES_REQUEST`);
export const FETCH_REGISTRIES_SUCCESS = createAction(`${actionsPrefix}/FETCH_REGISTRIES_SUCCESS`);
export const FETCH_REGISTRIES_ERROR = createAction(`${actionsPrefix}/FETCH_REGISTRIES_ERROR`);
export const FETCH_TEAMS_REQUEST = createAction(`${actionsPrefix}/FETCH_TEAMS_REQUEST`);
export const FETCH_TEAMS_SUCCESS = createAction(`${actionsPrefix}/FETCH_TEAMS_SUCCESS`);
export const FETCH_TEAMS_ERROR = createAction(`${actionsPrefix}/FETCH_TEAMS_ERROR`);
export const FETCH_SYSTEM_ROLES_REQUEST = createAction(`${actionsPrefix}/FETCH_SYSTEM_ROLES_REQUEST`);
export const FETCH_SYSTEM_ROLES_SUCCESS = createAction(`${actionsPrefix}/FETCH_SYSTEM_ROLES_SUCCESS`);
export const FETCH_SYSTEM_ROLES_ERROR = createAction(`${actionsPrefix}/FETCH_SYSTEM_ROLES_ERROR`);
export const UPDATE_ROLE_FOR_NAMESPACE_SUCCESS = createAction(`${actionsPrefix}/UPDATE_ROLE_FOR_NAMESPACE_SUCCESS`);
export const UPDATE_ROLE_FOR_REGISTRY_SUCCESS = createAction(`${actionsPrefix}/UPDATE_ROLE_FOR_REGISTRY_SUCCESS`);
export const UPDATE_ROLE_FOR_SYSTEM_SUCCESS = createAction(`${actionsPrefix}/UPDATE_ROLE_FOR_SYSTEM_SUCCESS`);
export const UPDATE_ROLE_FOR_TEAM_SUCCESS = createAction(`${actionsPrefix}/UPDATE_ROLE_FOR_TEAM_SUCCESS`);
export const setCanEdit = createAction(`${actionsPrefix}/SET_CAN_EDIT`);
export const setCanManageTeam = createAction(`${actionsPrefix}/SET_CAN_MANAGE_TEAM`);

export const selectTeam = (state) => (state.editTeam.team);

const defaultState = {
  team: {},
  canEdit: false,
  canManageTeam: false,
  meta: {
    loading: {
      sections: {
        team: false,
        namespaces: false,
        registries: false,
        system: false,
        teams: false,
      },
      loadingPercent: 100,
    },
  },
  namespacesRoles: {
    initialValues: {},
    currentRoles: [],
    availableNamespaces: [],
    suggestedNamespaces: [],
    rolesGrantable: [],
  },
  registriesRoles: {
    initialValues: {},
    currentRoles: [],
    availableRegistries: [],
    rolesGrantable: [],
  },
  teamsRoles: {
    initialValues: {},
    currentRoles: [],
    availableTeams: [],
    rolesGrantable: [],
  },
  systemRoles: {
    initialValues: {},
    rolesGrantable: [],
    globalGrantable: [],
  },
  registries: {
    count: 0,
    items: [],
  }
};

export default handleActions({
  [FETCH_TEAM_REQUEST]: (state) => ({
    ...state,
    team: defaultState.team,
    meta: {
      loading: computeLoading(state.meta.loading, 'team', true),
    },
  }),
  [FETCH_TEAM_SUCCESS]: (state, { payload }) => ({
    ...state,
    team: payload.data,
    meta: {
      loading: computeLoading(state.meta.loading, 'team', false),
    },
  }),
  [FETCH_TEAM_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'team', false),
      error: payload.error,
    },
  }),
  [FETCH_NAMESPACES_REQUEST]: (state) => ({
    ...state,
    namespaces: defaultState.namespaces,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespaces', true),
    },
  }),
  [combineActions(FETCH_NAMESPACES_SUCCESS, UPDATE_ROLE_FOR_NAMESPACE_SUCCESS)]: (state, { payload }) => {
    const data = payload.rolesData || payload.data;
    const initialValues = {};
    data.currentRoles.forEach(({ namespace: n, roles }) => {
      initialValues[n.id] = roles.reduce((acc, r) => ({ ...acc, [r]: true }), {});
    });
    return {
      ...state,
      namespacesRoles: {
        ...defaultState.namespacesRoles,
        initialValues,
        currentRoles: data.currentRoles,
        availableNamespaces: data.namespacesWithoutRoles,
        suggestedNamespaces: data.suggestedNamespaces,
        rolesGrantable: data.rolesGrantable,
      },
      meta: {
        loading: computeLoading(state.meta.loading, 'namespaces', false),
      },
    };
  },
  [FETCH_NAMESPACES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'namespaces', false),
      error: payload.error,
    },
  }),
  [FETCH_REGISTRIES_REQUEST]: (state) => ({
    ...state,
    registries: defaultState.registries,
    meta: {
      loading: computeLoading(state.meta.loading, 'registries', true),
    },
  }),
  [combineActions(FETCH_REGISTRIES_SUCCESS, UPDATE_ROLE_FOR_REGISTRY_SUCCESS)]: (state, { payload }) => {
    const data = payload.rolesData || payload.data;
    const initialValues = {};
    data.currentRoles.forEach(({ registry: reg, roles }) => {
      initialValues[reg.id] = roles.reduce((acc, r) => ({ ...acc, [r]: true }), {});
    });
    return {
      ...state,
      registriesRoles: {
        ...defaultState.registriesRoles,
        initialValues,
        currentRoles: data.currentRoles,
        availableRegistries: data.registriesWithoutRoles,
        rolesGrantable: data.rolesGrantable,
      },
      meta: {
        loading: computeLoading(state.meta.loading, 'registries', false),
      },
    };
  },
  [FETCH_REGISTRIES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'registries', false),
      error: payload.error,
    },
  }),
  [FETCH_TEAMS_REQUEST]: (state) => ({
    ...state,
    teams: defaultState.teams,
    meta: {
      loading: computeLoading(state.meta.loading, 'teams', true),
    },
  }),
  [combineActions(FETCH_TEAMS_SUCCESS, UPDATE_ROLE_FOR_TEAM_SUCCESS)]: (state, { payload }) => {
    const data = payload.rolesData || payload.data;
    const initialValues = {};
    data.currentRoles.forEach(({ team, roles }) => {
      initialValues[team.id] = roles.reduce((acc, r) => ({ ...acc, [r]: true }), {});
    });
    return {
      ...state,
      teamsRoles: {
        ...defaultState.teamsRoles,
        initialValues,
        currentRoles: data.currentRoles,
        availableTeams: data.teamsWithoutRoles,
        rolesGrantable: data.rolesGrantable,
      },
      meta: {
        loading: computeLoading(state.meta.loading, 'teams', false),
      },
    };
  },
  [FETCH_TEAMS_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      loading: computeLoading(state.meta.loading, 'teams', false),
      error: payload.error,
    },
  }),
  [FETCH_SYSTEM_ROLES_REQUEST]: (state) => ({
    ...state,
    systemRoles: defaultState.systemRoles,
    meta: {
      loading: computeLoading(state.meta.loading, 'system', true),
    },
  }),
  [combineActions(FETCH_SYSTEM_ROLES_SUCCESS, UPDATE_ROLE_FOR_SYSTEM_SUCCESS)]: (state, { payload }) => {
    const data = payload.rolesData || payload.data;
    const initialValues = data.currentRoles.reduce((acc, { name, global }) => ({
        ...acc,
        [name]: {
          system: true,
          global,
        }
      }), {});

    return {
      ...state,
      systemRoles: {
        ...defaultState.systemRoles,
        initialValues,
        rolesGrantable: data.rolesGrantable,
        globalGrantable: data.globalGrantable,
      },
      meta: {
        loading: computeLoading(state.meta.loading, 'system', false),
      },
    };
  },
  [FETCH_SYSTEM_ROLES_ERROR]: (state, { payload }) => ({
    ...state,
    systemRoles: defaultState.systemRoles,
    meta: {
      loading: computeLoading(state.meta.loading, 'system', false),
      error: payload.error,
    },
  }),
  [setCanEdit]: (state, { payload }) => ({
    ...state,
    canEdit: payload,
  }),
  [setCanManageTeam]: (state, { payload }) => ({
    ...state,
    canManageTeam: payload,
  }),
}, defaultState);
