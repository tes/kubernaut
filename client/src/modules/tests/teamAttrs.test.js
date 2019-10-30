import reduce, {
  initForm,
  FETCH_TEAM_REQUEST,
  FETCH_TEAM_SUCCESS,
  FETCH_TEAM_ERROR,
  setCanEdit,
} from '../teamAttrs';

describe('TeamAttrs Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, initForm(...args));

  describe('team', () => {
    it('should indicate when team info is loading', () => {
      const state = reduce(createInitialState(), FETCH_TEAM_REQUEST());
      expect(state.team).toMatchObject(createInitialState().team);
      expect(state.meta.loading.sections.team).toBe(true);
    });

    it('should update state when team info has loaded', () => {
      const data = { id: '123', name: 'abc', attributes: { a: 1 } };
      const state = reduce(createInitialState(), FETCH_TEAM_SUCCESS({ data }));
      expect(state.team).toBe(data);
      expect(state.initialValues.attributes.length).toBe(1);
      expect(state.initialValues.attributes[0]).toMatchObject({
        name: 'a',
        value: 1,
      });
      expect(state.meta.loading.sections.team).toBe(false);
    });

    it('should update state when team has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_TEAM_ERROR({ error: 'Oh Noes' }));
      expect(state.team.data).toBe(initialState.team.data);
      expect(state.meta.loading.sections.team).toBe(false);
    });
  });

  it('should set canEdit', () => {
    const state = reduce(createInitialState(), setCanEdit(true));
     expect(state.canEdit).toBe(true);
  });
});
