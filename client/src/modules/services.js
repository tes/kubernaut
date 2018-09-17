import { createAction, handleActions } from 'redux-actions';
import uuid from 'uuid';
const actionsPrefix = 'KUBERNAUT/SERVICES';
export const fetchServicesPagination = createAction(`${actionsPrefix}/FETCH_SERVICES_PAGINATION`);
export const toggleSort = createAction(`${actionsPrefix}/TOGGLE_SERVICES_SORT`);
export const initialise = createAction(`${actionsPrefix}/INITIALISE`);
export const FETCH_SERVICES_REQUEST = createAction(`${actionsPrefix}/FETCH_SERVICES_REQUEST`);
export const FETCH_SERVICES_SUCCESS = createAction(`${actionsPrefix}/FETCH_SERVICES_SUCCESS`);
export const FETCH_SERVICES_ERROR = createAction(`${actionsPrefix}/FETCH_SERVICES_ERROR`);
export const addFilter = createAction(`${actionsPrefix}/ADD_FILTER`);
export const removeFilter = createAction(`${actionsPrefix}/REMOVE_FILTER`);
export const search = createAction(`${actionsPrefix}/SEARCH`);
export const clearSearch = createAction(`${actionsPrefix}/CLEAR_SEARCH`);
export const showFilters = createAction(`${actionsPrefix}/SHOW_FILTERS`);
export const hideFilters = createAction(`${actionsPrefix}/HIDE_FILTERS`);

export const selectSortState = (state) => (state.services.sort);
export const selectTableFilters = (state) => {
  const filters = state.services.filter.filters;
  const search = state.services.filter.search;
  const starter = search.key === '' ? {} : {
    [search.key]: [{ value: search.value, not: search.not, exact: search.exact }],
  };

  return filters.reduce((acc, { key, value, not, exact }) => {
    if (!acc[key]) return { ...acc, [key]: [{ value, not, exact }]};
    return {
      ...acc,
      [key]: acc[key].concat({ value, not, exact}),
    };
  }, starter);
};

const defaultState = {
  data: {
    limit: 0,
    offset: 0,
    count: 0,
    pages: 0,
    page: 0,
    items: [],
  },
  meta: {},
  sort: {
    column: 'name',
    order: 'asc',
  },
  filter: {
    show: false,
    filters: [],
    search: {
      key: '',
      value: '',
      exact: false,
      not: false,
    },
    initialValues: {
      searchVal: '',
      column: 'name',
      exact: false,
      not: false,
    }
  },
};

export default handleActions({
  [initialise]: () => ({
    ...defaultState,
  }),
  [FETCH_SERVICES_REQUEST]: (state) => ({
    ...state,
    data: {
      ...defaultState.data,
    },
    meta: {
      loading: true,
    },
  }),
  [FETCH_SERVICES_SUCCESS]: (state, { payload }) => ({
    ...state,
    data: payload.data,
    meta: {
      loading: false,
    },
  }),
  [FETCH_SERVICES_ERROR]: (state, { payload }) => ({
    ...state,
    meta: {
      error: payload.error,
      loading: false,
    },
  }),
  [toggleSort]: (state, { payload }) => ({
    ...state,
    sort: {
      column: payload,
      order: state.sort.column === payload ? (state.sort.order === 'asc' ? 'desc' : 'asc') : 'asc',
    },
  }),
  [addFilter]: (state, { payload }) => {
    const { form: {
      searchVal,
      column,
      not = false,
      exact = false,
    }, columns } = payload;

    if (!searchVal || !column) return state;
    const newState = {
      ...state,
      filter: {
        ...state.filter,
        search: defaultState.filter.search,
        filters: state.filter.filters.concat({
          uuid: uuid.v4(),
          key: column,
          value: searchVal,
          exact,
          not,
          displayName: columns.find(({ value }) => (value === column)).display,
        }),
      }
    };
    return newState;
  },
  [removeFilter]: (state, { payload }) => {
    return {
      ...state,
      filter: {
        ...state.filter,
        filters: state.filter.filters.filter(({ uuid }) => (uuid !== payload)),
      },
    };
  },
  [search]: (state, { payload }) => {
    const {
      searchVal,
      column,
      not = false,
      exact = false,
    } = payload;

    if (!searchVal || !column) return state;
    return {
      ...state,
      filter: {
        ...state.filter,
        search: {
          key: column,
          value: searchVal,
          exact,
          not,
        }
      }
    };
  },
  [clearSearch]: (state) => ({
    ...state,
    filter: {
      ...state.filter,
      search: defaultState.filter.search,
    }
  }),
  [showFilters]: (state) => ({
    ...state,
    filter: {
      ...state.filter,
      show: true,
    }
  }),
  [hideFilters]: (state) => ({
    ...state,
    filter: {
      ...state.filter,
      show: false,
    }
  }),
}, defaultState);
