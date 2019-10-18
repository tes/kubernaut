import reduce, {
  FETCH_ACCOUNT_REQUEST,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  FETCH_TEAMS_REQUEST,
  FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR,
  UPDATE_TEAM_MEMBERSHIP_SUCCESS,
  setCanEdit,
  setCanManageTeam,
} from '../editAccountTeams';

describe('editAccountTeams Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, {});

  it('should indicate when teams are loading', () => {
    const state = reduce(createInitialState(), FETCH_TEAMS_REQUEST());
    expect(state.teamMembership).toMatchObject({
      initialValues: {},
      currentMembership: [],
      noMembership: [],
    });
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { teams: true } });
    expect(state.meta.loading.loadingPercent).toBeLessThan(100);
  });

  it('should update state when teams have loaded', () => {
    const data = {
      currentMembership: [{ id: 'abc', 'name': 'bob' }],
      noMembership: [{ id: 'xyz', 'name': 'jeff' }],
    };
    const expected = {
      initialValues: { abc: data.currentMembership[0] },
      currentMembership: [{ id: 'abc', 'name': 'bob' }],
      noMembership: [{ id: 'xyz', 'name': 'jeff' }],
    };
    const state = reduce(createInitialState(), FETCH_TEAMS_SUCCESS({ data }));
    expect(state.teamMembership).toMatchObject(expected);
    expect(state.meta).toMatchObject({ loading: { } });
    expect(state.meta.loading).toMatchObject({ sections: { teams: false } });
    expect(state.meta.loading.loadingPercent).toBe(100);
  });

  it('should update state when teams have errored', () => {
    const initialState = createInitialState();
    const state = reduce(initialState, FETCH_TEAMS_ERROR({ error: 'Oh Noes' }));
    expect(state.teamMembership).toBe(initialState.teamMembership);
    expect(state.meta).toMatchObject({ loading: { }, error: 'Oh Noes' });
    expect(state.meta.loading).toMatchObject({ sections: { teams: false } });
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

  it('should update team state when memberships have changed', () => {
    const existingMemberships = {
      currentMembership: [{ id: 'abc', 'name': 'bob' }],
      noMembership: [{ id: 'xyz', 'name': 'jeff' }],
    };
    const initialState = reduce(createInitialState(), FETCH_TEAMS_SUCCESS({ data: existingMemberships }));

    const newMemberships = {
      currentMembership: [{ id: 'abc', 'name': 'bob' }, { id: 'xyz', 'name': 'jeff' }],
      noMembership: [],
    };

    const expected = {
      initialValues: { abc: newMemberships.currentMembership[0], xyz: newMemberships.currentMembership[1] },
      currentMembership: [{ id: 'abc', 'name': 'bob' }, { id: 'xyz', 'name': 'jeff' }],
      noMembership: [],
    };
    const state = reduce(initialState, UPDATE_TEAM_MEMBERSHIP_SUCCESS({ data: newMemberships }));
    expect(state.teamMembership).toMatchObject(expected);
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
