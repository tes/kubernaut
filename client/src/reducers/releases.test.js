import reduce from './releases';
import {
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
} from '../actions/release';

describe('Releases Reducer', () => {

  it('should indicate when releases are loading', () => {
    const state = reduce(undefined, { type: FETCH_RELEASES_REQUEST, loading: true, data: {} });
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when releases have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_RELEASES_SUCCESS, data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] } });
    expect(state.data.limit).toBe(50);
    expect(state.data.offset).toBe(0);
    expect(state.data.count).toBe(3);
    expect(state.data.items).toMatchObject([1, 2, 3]);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when releases have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_RELEASES_ERROR, error: 'Oh Noes', data: {} });
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });

});
