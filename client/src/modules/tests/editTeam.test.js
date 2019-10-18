import reduce, {
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
  FETCH_REGISTRIES_REQUEST,
  FETCH_REGISTRIES_SUCCESS,
  FETCH_REGISTRIES_ERROR,
  FETCH_SYSTEM_ROLES_REQUEST,
  FETCH_SYSTEM_ROLES_SUCCESS,
  FETCH_SYSTEM_ROLES_ERROR,
  UPDATE_ROLE_FOR_NAMESPACE_SUCCESS,
  UPDATE_ROLE_FOR_REGISTRY_SUCCESS,
  UPDATE_ROLE_FOR_SYSTEM_SUCCESS,
  setCanEdit,
  setCanManageTeam,
} from '../editTeam';

describe('editTeam Reducer', () => {
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

  it('should update state when registries have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_REGISTRIES_ERROR({ error: 'Oh Noes' }));
    expect(state.registriesRoles).toBe(initialState.registriesRoles);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { registries: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should indicate when team is loading', () => {
    const state = reduce(createInitialState(), FETCH_TEAM_REQUEST());
    expect(state.team).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { team: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when team has loaded', () => {
    const data = { a: 1 };
    const state = reduce(createInitialState(), FETCH_TEAM_SUCCESS({ data }));
    expect(state.team).toBe(data);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { team: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when team has errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_TEAM_ERROR({ error: 'Oh Noes' }));
    expect(state.team).toBe(initialState.team);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { team: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update team state when namespace roles have changed', () => {
    const initialState = { ...createInitialState(), team: { a: 1 } };
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

  it('should update team state when registry roles have changed', () => {
    const initialState = { ...createInitialState(), team: { a: 1 } };
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

  it('should update team state when system roles have changed', () => {
    const initialState = { ...createInitialState(), team: { a: 1 } };
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

  it('should set canManageTeam state', () => {
    const state = reduce(undefined, setCanManageTeam(true));
    expect(state.canManageTeam).toBe(true);
  });
});
