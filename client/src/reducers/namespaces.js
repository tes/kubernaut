import {
  FETCH_NAMESPACES_REQUEST,
  FETCH_NAMESPACES_SUCCESS,
  FETCH_NAMESPACES_ERROR,
} from '../actions/namespace';

export default function(state = { data: { limit: 0, offset: 0, count: 0, pages: 0, currentPage: 0, items: [] }, meta: {} }, action)  {
  switch (action.type) {
    case FETCH_NAMESPACES_REQUEST:
    case FETCH_NAMESPACES_SUCCESS:
    case FETCH_NAMESPACES_ERROR: {
      return {
        ...state,
        data: {
          ...action.data,
          pages: action.data.limit ? Math.ceil(action.data.count / action.data.limit) : 0,
          currentPage: action.data.limit ? Math.floor(action.data.offset / action.data.limit) + 1 : 0,
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
