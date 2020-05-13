import reduce, {
  initialiseJobVersionPage,
  FETCH_JOB_VERSION_REQUEST,
  FETCH_JOB_VERSION_SUCCESS,
  FETCH_JOB_VERSION_ERROR,
  setLogOutput,
  setLogOutputError,
} from '../jobVersion';

describe('JobVersion Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, initialiseJobVersionPage(...args));

  describe('version', () => {
    it('should indicate when job version info is loading', () => {
      const state = reduce(createInitialState(), FETCH_JOB_VERSION_REQUEST());
      expect(state.jobVersion.data).toMatchObject(createInitialState().jobVersion.data);
      expect(state.meta.loading.sections.jobVersion).toBe(true);
    });

    it('should update state when job version info has loaded', () => {
      const data = { id: '123' };
      const state = reduce(createInitialState(), FETCH_JOB_VERSION_SUCCESS({ data }));
      expect(state.jobVersion.data).toBe(data);
      expect(state.meta.loading.sections.jobVersion).toBe(false);
    });

    it('should update state when job version has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_JOB_VERSION_ERROR({ error: 'Oh Noes' }));
      expect(state.jobVersion.data).toBe(initialState.jobVersion.data);
      expect(state.meta.loading.sections.jobVersion).toBe(false);
    });
  });


  describe('apply log', () => {
    it('should set log output & open modal', () => {
      const log = [1,2,3];
      const state = reduce(createInitialState(), setLogOutput({ log }));
      expect(state.applyLog).toBe(log);
      expect(state.logOpen).toBe(true);
    });

    it('should set log error output and open modal', () => {
      const data = 'some error text';
      const state = reduce(createInitialState(), setLogOutputError(data));
      expect(state.applyError).toBe(data);
      expect(state.logOpen).toBe(true);
    });
  });
});
