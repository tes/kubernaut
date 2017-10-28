import {
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
} from '../actions/release';

export default function(state = { data: [], meta: {}, }, action)  {
  switch (action.type) {
    case FETCH_RELEASES_REQUEST:
    case FETCH_RELEASES_SUCCESS:
    case FETCH_RELEASES_ERROR: {
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
