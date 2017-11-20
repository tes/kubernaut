import reduce from './deployments';
import {
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../actions/deployment';

describe('Deployments Reducer', () => {

  it('should indicate when deployments are loading', () => {
    const state = reduce(undefined, { type: FETCH_DEPLOYMENTS_REQUEST, loading: true, data: [], });
    expect(state.data).toMatchObject([]);
    expect(state.meta).toMatchObject({ loading: true, });
  });

  it('should update state when deployments have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENTS_SUCCESS, data: [1, 2, 3,], });
    expect(state.data).toMatchObject([1, 2, 3,]);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when deployments have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENTS_ERROR, error: 'Oh Noes', data: [], });
    expect(state.data).toMatchObject([]);
    expect(state.meta).toMatchObject({ error: 'Oh Noes', });
  });

});
