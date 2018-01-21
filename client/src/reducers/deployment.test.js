import reduce from './deployment';
import {
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
} from '../actions/deployment';

describe('Deployment Reducer', () => {

  it('should indicate when deployment is loading', () => {
    const state = reduce(undefined, { type: FETCH_DEPLOYMENT_REQUEST, loading: true, data: {}, });
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true, });
  });

  it('should update state when deployment has loaded', () => {
    const initialState = {
      data: {},
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENT_SUCCESS, data: { id: 12345, },});
    expect(state.data.id).toBe(12345);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when deployment has errored', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, { type: FETCH_DEPLOYMENT_ERROR, error: 'Oh Noes', data: {}, });
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ error: 'Oh Noes', });
  });

});
