import reduce, {
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
  openModal,
  closeModal,
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

});
