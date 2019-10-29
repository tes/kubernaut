import reduce, {
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
  setCanEdit,
  setCanDelete,
} from '../editAccount';

describe('editAccount Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, {});

  it('should indicate when namespaces are loading', () => {
    const state = reduce(createInitialState(), FETCH_NAMESPACES_REQUEST());
    expect(state.namespacesRoles).toMatchObject({
      initialValues: {},
      currentRoles: [],
      availableNamespaces: [],
      rolesGrantable: [],
    });
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { namespaces: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when namespaces have loaded', () => {
    const rolesData = {
      currentRoles: [{ namespace: { id: 'abc' }, roles: ['a']}],
      namespacesWithoutRoles: [1],
      rolesGrantable: [2]
    };
    const expected = {
      initialValues: { abc: { a: true } },
      currentRoles: rolesData.currentRoles,
      availableNamespaces: rolesData.namespacesWithoutRoles,
      rolesGrantable: rolesData.rolesGrantable,
    };
    const state = reduce(createInitialState(), FETCH_NAMESPACES_SUCCESS({ rolesData }));
    expect(state.namespacesRoles).toMatchObject(expected);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { namespaces: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when namespaces have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_NAMESPACES_ERROR({ error: 'Oh Noes' }));
    expect(state.namespacesRoles).toBe(initialState.namespacesRoles);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { namespaces: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should indicate when regisitries are loading', () => {
    const state = reduce(createInitialState(), FETCH_REGISTRIES_REQUEST());
    expect(state.registriesRoles).toMatchObject({
      initialValues: {},
      currentRoles: [],
      availableRegistries: [],
      rolesGrantable: [],
    });
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { registries: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when regisitries have loaded', () => {
    const rolesData = {
      currentRoles: [{ registry: { id: 'abc' }, roles: ['a']}],
      registriesWithoutRoles: [1],
      rolesGrantable: [2]
    };
    const expected = {
      initialValues: { abc: { a: true } },
      currentRoles: rolesData.currentRoles,
      availableRegistries: rolesData.registriesWithoutRoles,
      rolesGrantable: rolesData.rolesGrantable,
    };
    const state = reduce(createInitialState(), FETCH_REGISTRIES_SUCCESS({ rolesData }));
    expect(state.registriesRoles).toMatchObject(expected);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { registries: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should indicate when teams are loading', () => {
    const state = reduce(createInitialState(), FETCH_TEAMS_REQUEST());
    expect(state.teamsRoles).toMatchObject({
      initialValues: {},
      currentRoles: [],
      availableTeams: [],
      rolesGrantable: [],
    });
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { teams: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when teams have loaded', () => {
    const rolesData = {
      currentRoles: [{ team: { id: 'abc' }, roles: ['a']}],
      teamsWithoutRoles: [1],
      rolesGrantable: [2]
    };
    const expected = {
      initialValues: { abc: { a: true } },
      currentRoles: rolesData.currentRoles,
      availableTeams: rolesData.teamsWithoutRoles,
      rolesGrantable: rolesData.rolesGrantable,
    };
    const state = reduce(createInitialState(), FETCH_TEAMS_SUCCESS({ rolesData }));
    expect(state.teamsRoles).toMatchObject(expected);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { teams: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when teams have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_TEAMS_ERROR({ error: 'Oh Noes' }));
    expect(state.teamsRoles).toBe(initialState.teamsRoles);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { teams: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when registries have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_REGISTRIES_ERROR({ error: 'Oh Noes' }));
    expect(state.registriesRoles).toBe(initialState.registriesRoles);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { registries: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should indicate when account is loading', () => {
    const state = reduce(createInitialState(), FETCH_ACCOUNT_REQUEST());
    expect(state.account).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { account: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when account has loaded', () => {
    const data = { a: 1 };
    const state = reduce(createInitialState(), FETCH_ACCOUNT_SUCCESS({ data }));
    expect(state.account).toBe(data);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { account: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when account has errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_ACCOUNT_ERROR({ error: 'Oh Noes' }));
    expect(state.account).toBe(initialState.account);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { account: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update account state when namespace roles have changed', () => {
    const initialState = { ...createInitialState(), account: { a: 1 } };
    const newRolesData = {
      currentRoles: [{ namespace: { id: 'abc' }, roles: ['a']}],
      namespacesWithoutRoles: [1],
      rolesGrantable: [2]
    };
    const expected = {
      initialValues: { abc: { a: true } },
      currentRoles: newRolesData.currentRoles,
      availableNamespaces: newRolesData.namespacesWithoutRoles,
      rolesGrantable: newRolesData.rolesGrantable,
    };
    const state = reduce(initialState, UPDATE_ROLE_FOR_NAMESPACE_SUCCESS({ data: newRolesData }));
    expect(state.namespacesRoles).toMatchObject(expected);
  });

  it('should update account state when registry roles have changed', () => {
    const initialState = { ...createInitialState(), account: { a: 1 } };
    const newRolesData = {
      currentRoles: [{ registry: { id: 'abc' }, roles: ['a']}],
      registriesWithoutRoles: [1],
      rolesGrantable: [2]
    };
    const expected = {
      initialValues: { abc: { a: true } },
      currentRoles: newRolesData.currentRoles,
      availableRegistries: newRolesData.registriesWithoutRoles,
      rolesGrantable: newRolesData.rolesGrantable,
    };
    const state = reduce(initialState, UPDATE_ROLE_FOR_REGISTRY_SUCCESS({ data: newRolesData }));
    expect(state.registriesRoles).toMatchObject(expected);
  });

  it('should indicate when system roles are loading', () => {
    const state = reduce(createInitialState(), FETCH_SYSTEM_ROLES_REQUEST());
    expect(state.systemRoles).toMatchObject({
      initialValues: {},
      rolesGrantable: [],
    });
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { system: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when system roles have loaded', () => {
    const rolesData = {
      currentRoles: [{ name: 'developer', global: false }],
      rolesGrantable: [2]
    };
    const expected = {
      initialValues: { developer: { system: true, global: false } },
      rolesGrantable: rolesData.rolesGrantable,
    };
    const state = reduce(createInitialState(), FETCH_SYSTEM_ROLES_SUCCESS({ rolesData }));
    expect(state.systemRoles).toMatchObject(expected);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { system: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when system roles have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_SYSTEM_ROLES_ERROR({ error: 'Oh Noes' }));
    expect(state.systemRoles).toBe(initialState.systemRoles);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { system: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update account state when system roles have changed', () => {
    const initialState = { ...createInitialState(), account: { a: 1 } };
    const newRolesData = {
      currentRoles: [{ name: 'developer', global: true }],
      rolesGrantable: [2]
    };
    const expected = {
      initialValues: {
        developer: { system: true, global: true },
      },
      rolesGrantable: newRolesData.rolesGrantable,
    };
    const state = reduce(initialState, UPDATE_ROLE_FOR_SYSTEM_SUCCESS({ data: newRolesData }));
    expect(state.systemRoles).toMatchObject(expected);
  });

  it('should set canEdit state', () => {
    const state = reduce(undefined, setCanEdit(true));
    expect(state.canEdit).toBe(true);
  });

  it('should set canDelete state', () => {
    const state = reduce(undefined, setCanDelete(true));
    expect(state.canDelete).toBe(true);
  });
});
