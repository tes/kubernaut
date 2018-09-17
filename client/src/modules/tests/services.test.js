import reduce, {
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  toggleSort,
  initialise,
  addFilter,
  removeFilter,
  showFilters,
  hideFilters,
  search,
  clearSearch,
} from '../services';

describe('Services Reducer', () => {

  it('should indicate when services are loading', () => {
    const state = reduce(undefined, FETCH_SERVICES_REQUEST());
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when services have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_SERVICES_SUCCESS({ data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] } }));
    expect(state.data.limit).toBe(50);
    expect(state.data.offset).toBe(0);
    expect(state.data.count).toBe(3);
    expect(state.data.items).toMatchObject([1, 2, 3]);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when services have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_SERVICES_ERROR({ error: 'Oh Noes' }));
    expect(state.data).toMatchObject(initialState.data);
    expect(state.meta).toMatchObject({ error: 'Oh Noes' });
  });


  it('should toggle the same column to the alternate order', () => {
    const initialState = {
      sort: {
        column: 'abc',
        order: 'asc'
      },
    };

    const firstToggle = reduce(initialState, toggleSort('abc'));
    expect(firstToggle.sort.order).toBe('desc');
    const secondToggle = reduce(firstToggle, toggleSort('abc'));
    expect(secondToggle.sort.order).toBe('asc');
  });

  it('should toggle to a new column and reset to ascending', () => {
    const initialState = {
      sort: {
        column: 'abc',
        order: 'desc'
      },
    };

    const result = reduce(initialState, toggleSort('def'));
    expect(result.sort.column).toBe('def');
    expect(result.sort.order).toBe('asc');
  });

  it('should add a filter', () => {
    const initialState = reduce({}, initialise());
    const columns = [{ value: 'abc', display: 'Abc' }];
    const filterDetails = {
      searchVal: 'abc',
      column: 'abc',
      not: true,
      exact: true,
    };
    const result = reduce(initialState, addFilter({ form: filterDetails, columns }));
    expect(result.filter.filters.length).toBe(1);
    expect(result.filter.filters[0]).toMatchObject({
      key: filterDetails.column,
      value: filterDetails.searchVal,
      exact: true,
      not: true,
      displayName: 'Abc',
    });
  });

  it('should remove a filter', () => {
    const initialState = {
      filter: {
        filters: [
          { uuid: 'abc'}
        ]
      }
    };

    const result = reduce(initialState, removeFilter('abc'));
    expect(result.filter.filters.length).toBe(0);
  });

  it('should set filters to display', () => {
    const initialState = reduce({}, initialise());
    const result = reduce(initialState, showFilters());
    expect(result.filter.show).toBe(true);
  });

  it('should set filters to hide', () => {
    const initialState = reduce({}, showFilters());
    const result = reduce(initialState, hideFilters());
    expect(result.filter.show).toBe(false);
  });

  it('should set search values', () => {
    const initialState = reduce({}, initialise());
    const searchForm = {
      searchVal: 'abc',
      column: 'abc',
      not: true,
      exact: true,
    };

    const result = reduce(initialState, search(searchForm));
    expect(result.filter.filters.length).toBe(0);
    expect(result.filter.search).toMatchObject({
      key: searchForm.column,
      value: searchForm.searchVal,
      exact: true,
      not: true,
    });
  });

  it('should clear search values', () => {
    const initialState = {
      filter: {
        search: {
          key: 'abc',
          value: '123',
          exact: true,
          not: true,
        }
      }
    };

    const result = reduce(initialState, clearSearch());
    expect(result.filter.search.key).toBe('');
    expect(result.filter.search.value).toBe('');
    expect(result.filter.search.exact).toBe(false);
    expect(result.filter.search.not).toBe(false);
  });
});
