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
  UPDATE_ROLE_FOR_NAMESPACE_SUCCESS,
  UPDATE_ROLE_FOR_REGISTRY_SUCCESS,
  setCanEdit,
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
    expect(state.namespaces).toBe(initialState.namespaces);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { namespaces: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should indicate when regisitries are loading', () => {
    const state = reduce(createInitialState(), FETCH_REGISTRIES_REQUEST());
    expect(state.registries).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { registries: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when regisitries have loaded', () => {
    const data = { limit: 50, offset: 0, count: 3, items: [1, 2, 3] };
    const state = reduce(createInitialState(), FETCH_REGISTRIES_SUCCESS({ data }));
    expect(state.registries).toBe(data);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { registries: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when registries have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_REGISTRIES_ERROR({ error: 'Oh Noes' }));
    expect(state.registries).toBe(initialState.registries);
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
    const newAccountData = { b: 1 };
    const state = reduce(initialState, UPDATE_ROLE_FOR_REGISTRY_SUCCESS({ data: newAccountData }));
    expect(state.account).toMatchObject(newAccountData);
  });

  it('should set canEdit state', () => {
    const state = reduce(undefined, setCanEdit(true));
    expect(state.canEdit).toBe(true);
  });
});
