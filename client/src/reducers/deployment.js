import {
  FETCH_DEPLOYMENT_REQUEST,
  FETCH_DEPLOYMENT_SUCCESS,
  FETCH_DEPLOYMENT_ERROR,
} from '../actions/deployment';

export default function(state = {}, action)  {
  switch (action.type) {
    case FETCH_DEPLOYMENT_REQUEST:
    case FETCH_DEPLOYMENT_SUCCESS:
    case FETCH_DEPLOYMENT_ERROR: {
      return {
        ...state,
        data: {
          ...action.data,
        },
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
