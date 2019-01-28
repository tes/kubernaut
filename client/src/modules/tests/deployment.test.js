import reduce, {
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
  openModal,
  closeModal,
  setCanEdit,
  toggleManifestOpen,
  updateDeploymentStatus,
} from '../deployment';

describe('Deployment Reducer', () => {

  describe('fetch', () => {
    it('should indicate when deployment is loading', () => {
      const state = reduce(undefined, FETCH_DEPLOYMENT_REQUEST());
      expect(state.meta).toMatchObject({ loading: true });
    });

    it('should update state when deployment has loaded', () => {
      const initialState = {
        data: {},
        meta: {
          loading: true,
        },
      };
      const state = reduce(initialState, FETCH_DEPLOYMENT_SUCCESS({ data: { id: 12345 }}));
      expect(state.data.id).toBe(12345);
      expect(state.meta).toMatchObject({ loading: false });
    });

    it('should update state when deployment has errored', () => {
      const initialState = {
        data: [],
        meta: {
          loading: true,
        },
      };
      const state = reduce(initialState, FETCH_DEPLOYMENT_ERROR({ error: 'Oh Noes' }));
      expect(state.data).toMatchObject(initialState.data);
      expect(state.meta).toMatchObject({ error: 'Oh Noes' });
    });
  });

  it('sets canEdit', () => {
    const state = reduce(undefined, setCanEdit(true));
    expect(state.canEdit).toBe(true);
  });

  describe('modal', () => {
    it('sets modal to open', () => {
      const state = reduce(undefined, openModal());
      expect(state.modalOpen).toBe(true);
    });

    it('sets modal to closed', () => {
      const initialState = reduce(undefined, openModal());
      const state = reduce(initialState, closeModal());
      expect(state.modalOpen).toBe(false);
    });
  });

  describe('Manifest collapse', () => {
    it('should toggle manifest collapse open state', () => {
      let state = reduce(undefined, toggleManifestOpen());
      expect(state.manifestOpen).toBe(true);
      state = reduce(state, toggleManifestOpen());
      expect(state.manifestOpen).toBe(false);
    });
  });

  describe('Update status', () => {
    it('Updates state when new status information is passed', () => {
      const initialState = {
        data: {
          status: 'bob',
          applyExitCode: null,
          rolloutStatusExitCode: null,
          log: [],
        },
      };
      const payload = {
        status: 'pending',
        applyExitCode: 1,
        rolloutStatusExitCode: 0,
        log: [{a: 1}],
      };
      const state = reduce(initialState, updateDeploymentStatus(payload));
      expect(state.data).toMatchObject(payload);
    });
  });
});
