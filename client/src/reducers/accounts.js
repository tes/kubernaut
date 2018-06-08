import {
  FETCH_ACCOUNTS_REQUEST,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR,
} from '../actions/account';

export default function(state = { data: { limit: 0, offset: 0, count: 0, pages: 0, page: 0, items: [] }, meta: {} }, action)  {
  switch (action.type) {
    case FETCH_ACCOUNTS_REQUEST:
    case FETCH_ACCOUNTS_SUCCESS:
    case FETCH_ACCOUNTS_ERROR: {
      return {
        ...state,
        data: {
          ...action.data,
          pages: action.data.limit ? Math.ceil(action.data.count / action.data.limit) : 0,
          page: action.data.limit ? Math.floor(action.data.offset / action.data.limit) + 1 : 0,
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
