import { createAction } from 'redux-actions';
import { get as _get } from 'lodash';
import uuid from 'uuid';

export const createFilterActions= (actionsPrefix) => ({
  addFilter: createAction(`${actionsPrefix}/ADD_FILTER`),
  removeFilter: createAction(`${actionsPrefix}/REMOVE_FILTER`),
  search: createAction(`${actionsPrefix}/SEARCH`),
  clearSearch: createAction(`${actionsPrefix}/CLEAR_SEARCH`),
  showFilters: createAction(`${actionsPrefix}/SHOW_FILTERS`),
  hideFilters: createAction(`${actionsPrefix}/HIDE_FILTERS`),
});

export const createFilterSelectors = (statePath) => ({
  selectTableFilters: (state) => {
    const filters = _get(state, statePath).filters;
    const search = _get(state, statePath).search;
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
  },
});

export const createDefaultFilterState = ({ defaultColumn }) => ({
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
    column: defaultColumn,
    exact: false,
    not: false,
  }
});

export const createFilterReducers = (actions, defaultState, statePath = 'filter') => {
  const {
    addFilter,
    removeFilter,
    search,
    clearSearch,
    showFilters,
    hideFilters,
  } = actions;

  return {
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
        [statePath]: {
          ..._get(state, statePath),
          search: defaultState.search,
          filters: _get(state, statePath).filters.concat({
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
        [statePath]: {
          ..._get(state, statePath),
          filters: _get(state, statePath).filters.filter(({ uuid }) => (uuid !== payload)),
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
        [statePath]: {
          ..._get(state, statePath),
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
      [statePath]: {
        ..._get(state, statePath),
        search: defaultState.search,
      }
    }),
    [showFilters]: (state) => ({
      ...state,
      [statePath]: {
        ..._get(state, statePath),
        show: true,
      }
    }),
    [hideFilters]: (state) => ({
      ...state,
      [statePath]: {
        ..._get(state, statePath),
        show: false,
      }
    }),
  };
};
