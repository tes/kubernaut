import { createAction } from 'redux-actions';
import { get as _get, pickBy as _pickBy, identity as _identity } from 'lodash';
import uuid from 'uuid';
import { parse, stringify as makeQueryString } from 'querystring';

export const createFilterActions = (actionsPrefix) => ({
  addFilter: createAction(`${actionsPrefix}/ADD_FILTER`),
  removeFilter: createAction(`${actionsPrefix}/REMOVE_FILTER`),
  search: createAction(`${actionsPrefix}/SEARCH`),
  clearSearch: createAction(`${actionsPrefix}/CLEAR_SEARCH`),
  showFilters: createAction(`${actionsPrefix}/SHOW_FILTERS`),
  hideFilters: createAction(`${actionsPrefix}/HIDE_FILTERS`),
  setFilters: createAction(`${actionsPrefix}/SET_FILTERS`),
  setSearch: createAction(`${actionsPrefix}/SET_SEARCH`),
});

export const parseFiltersFromQS = (qs) => {
  const simpleParsed = parse(qs.match(/\??(.*)/)[1]);
  const filters = [];
  for (const key in simpleParsed) {
    [].concat(simpleParsed[key]).forEach(filterString => {
      const { value, not, exact } = parse(filterString, ',', ':');
      filters.push({
        uuid: uuid.v4(),
        key,
        value,
        not: not === 'true',
        exact: exact === 'true',
      });
    });
  }

  return filters;
};

export const parseSearchFromQS = (qs) => {
  const parsed = parse(qs);
  return {
    key: parsed.key || '',
    value: parsed.value || '',
    not: parsed.not === 'true',
    exact: parsed.exact === 'true',
  };
};

const stripFalsy = (obj) => (_pickBy(obj, _identity));
export const stringifyFiltersForQS = (filters) => {
  return makeQueryString(Object.keys(filters).reduce((acc, key) => {
    return {
      ...acc,
      [key]: filters[key].map((filter) => makeQueryString(stripFalsy(filter), ',', ':')),
    };
  }, {}));
};

export const stringifySearchForQS = (obj) => makeQueryString(stripFalsy(obj));

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
  selectSearchFilter: (state) => _get(state, statePath).search,
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
    setFilters,
    setSearch,
  } = actions;

  return {
    [addFilter]: (state, { payload }) => {
      const { form: {
        searchVal,
        column,
        not = false,
        exact = false,
      } } = payload;

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
    [setFilters]: (state, { payload }) => ({
      ...state,
      [statePath]: {
        ..._get(state, statePath),
        filters: payload,
        show: _get(state, statePath).show || payload.length > 0,
      }
    }),
    [setSearch]: (state, { payload }) => ({
      ...state,
      [statePath]: {
        ..._get(state, statePath),
        search: { ...defaultState.search, ...payload },
        show: _get(state, statePath).show || !!payload.value,
        initialValues: {
          searchVal: payload.value || defaultState.initialValues.searchVal,
          column: payload.key || defaultState.initialValues.column,
          exact: payload.exact || defaultState.initialValues.exact,
          not: payload.not || defaultState.initialValues.not,
        }
      }
    }),
  };
};
