import reduce, {
  INITIALISE,
  FETCH_JOB_REQUEST,
  FETCH_JOB_SUCCESS,
  FETCH_JOB_ERROR,
  FETCH_JOB_VERSIONS_SUCCESS,
  FETCH_JOB_VERSIONS_ERROR,
} from '../newJobVersion';

describe('newJobVersion Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, INITIALISE(...args));

  describe('job', () => {
    it('should indicate when job info is loading', () => {
      const state = reduce(createInitialState(), FETCH_JOB_REQUEST());
      expect(state.job.data).toMatchObject({});
      expect(state.meta.loading.sections.job).toBe(true);
      expect(state.meta.loading.sections.priorVersion).toBe(true);
    });

    it('should update state when job info has loaded', () => {
      const data = { id: '123', name: 'abc' };
      const state = reduce(createInitialState(), FETCH_JOB_SUCCESS({ data }));
      expect(state.job.data).toBe(data);
      expect(state.meta.loading.sections.job).toBe(false);
    });

    it('should update state when job has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_JOB_ERROR({ error: 'Oh Noes' }));
      expect(state.job.data).toBe(initialState.job.data);
      expect(state.meta.loading.sections.job).toBe(false);
    });
  });

  describe('prior version', () => {
    it('should update state when there is a prior version to use', () => {
      const version = {
        values: {
          schedule: '1 2 3',
          labels: ['a'],
        },
      };
      const state = reduce(createInitialState(), FETCH_JOB_VERSIONS_SUCCESS({ version }));
      expect(state.initialValues).toMatchObject({ ...createInitialState().initialValues, ...version.values });
      expect(state.meta.loading.sections.priorVersion).toBe(false);
    });

    it('should update state when version has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_JOB_VERSIONS_ERROR({ error: 'Oh Noes' }));
      expect(state.initialValues).toMatchObject(initialState.initialValues);
      expect(state.meta.loading.sections.priorVersion).toBe(false);
    });
  });
});
