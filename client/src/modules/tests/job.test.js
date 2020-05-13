import reduce, {
  fetchJobPageData,
  FETCH_JOB_REQUEST,
  FETCH_JOB_SUCCESS,
  FETCH_JOB_ERROR,
  FETCH_JOB_VERSIONS_REQUEST,
  FETCH_JOB_VERSIONS_SUCCESS,
  FETCH_JOB_VERSIONS_ERROR,
  FETCH_JOB_SNAPSHOT_REQUEST,
  FETCH_JOB_SNAPSHOT_SUCCESS,
  FETCH_JOB_SNAPSHOT_ERROR,
} from '../job';

describe('Job Reducer', () => {
  const createInitialState = (...args) => reduce(undefined, fetchJobPageData(...args));

  describe('job', () => {
    it('should indicate when job info is loading', () => {
      const state = reduce(createInitialState(), FETCH_JOB_REQUEST());
      expect(state.job.data).toMatchObject({});
      expect(state.meta.loading.sections.job).toBe(true);
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

  describe('versions', () => {
    it('should indicate when version info is loading', () => {
      const state = reduce(createInitialState(), FETCH_JOB_VERSIONS_REQUEST());
      expect(state.versions).toMatchObject(createInitialState().versions);
      expect(state.meta.loading.sections.versions).toBe(true);
    });

    it('should update state when version info has loaded', () => {
      const data = { limit: 5, offset: 5, count: 30, pages: 6, page: 2, items: [{a: 1}] };
      const state = reduce(createInitialState(), FETCH_JOB_VERSIONS_SUCCESS({ data }));
      expect(state.versions.data).toBe(data);
      expect(state.meta.loading.sections.versions).toBe(false);
    });

    it('should update state when version has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_JOB_VERSIONS_ERROR({ error: 'Oh Noes' }));
      expect(state.versions.data).toBe(initialState.versions.data);
      expect(state.meta.loading.sections.versions).toBe(false);
    });
  });

  describe('snapshot', () => {
    it('should indicate when snapshot info is loading', () => {
      const state = reduce(createInitialState(), FETCH_JOB_SNAPSHOT_REQUEST());
      expect(state.snapshot).toBe(createInitialState().snapshot);
      expect(state.meta.loading.sections.snapshot).toBe(true);
    });

    it('should update state when snapshot info has loaded', () => {
      const data = { anything: true };
      const state = reduce(createInitialState(), FETCH_JOB_SNAPSHOT_SUCCESS({ data }));
      expect(state.snapshot).toBe(data);
      expect(state.meta.loading.sections.snapshot).toBe(false);
    });

    it('should update state when snapshot has errored', () => {
      const initialState = createInitialState();
      const state = reduce(initialState, FETCH_JOB_SNAPSHOT_ERROR({ error: 'Oh Noes' }));
      expect(state.snapshot).toBe(initialState.snapshot);
      expect(state.meta.loading.sections.snapshot).toBe(false);
    });
  });
});
