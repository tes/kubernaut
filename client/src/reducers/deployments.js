import {
  FETCH_DEPLOYMENTS_REQUEST,
  FETCH_DEPLOYMENTS_SUCCESS,
  FETCH_DEPLOYMENTS_ERROR,
} from '../actions/deployment';

export default function(state = { data: [], meta: {}, }, action)  {
  switch (action.type) {
    case FETCH_DEPLOYMENTS_REQUEST:
    case FETCH_DEPLOYMENTS_SUCCESS:
    case FETCH_DEPLOYMENTS_ERROR: {
      return {
        ...state,
        data: action.data || [],
        meta: {
          error: action.error,
          loading: !!action.loading,
        },
      };
    }
    default: {
      return state;
    }
  }
}
