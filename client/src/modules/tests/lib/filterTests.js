import { get as _get } from 'lodash';

export default (module, statePath = 'filter') => {
  const reduce = module.default;
  const {
    addFilter,
    removeFilter,
    showFilters,
    hideFilters,
    search,
    clearSearch,
  } = module;

  describe('Filter tests', () => {
    it('should add a filter', () => {
      const initialState = reduce(undefined, { });
      const filterDetails = {
        searchVal: 'abc',
        column: '123',
        not: true,
        exact: true,
      };
      const result = reduce(initialState, addFilter({ form: filterDetails }));
      expect(_get(result, statePath).filters.length).toBe(1);
      expect(_get(result, statePath).filters[0]).toMatchObject({
        key: filterDetails.column,
        value: filterDetails.searchVal,
        exact: true,
        not: true,
      });
    });

    it('should add a filter not from the form prop', () => {
      const initialState = reduce(undefined, { });
      const filters = [{
        value: 'abc',
        key: '123',
        not: true,
        exact: true,
      }];
      const result = reduce(initialState, addFilter({ filters: filters }));
      expect(_get(result, statePath).filters.length).toBe(1);
      expect(_get(result, statePath).filters[0]).toMatchObject({
        value: 'abc',
        key: '123',
        exact: true,
        not: true,
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
      expect(_get(result, statePath).filters.length).toBe(0);
    });

    it('should set filters to display', () => {
      const initialState = reduce(undefined, { });
      const result = reduce(initialState, showFilters());
      expect(_get(result, statePath).show).toBe(true);
    });

    it('should set filters to hide', () => {
      const initialState = reduce({}, showFilters());
      const result = reduce(initialState, hideFilters());
      expect(_get(result, statePath).show).toBe(false);
    });

    it('should set search values', () => {
      const initialState = reduce(undefined, { });
      const searchForm = {
        searchVal: 'abc',
        column: 'abc',
        not: true,
        exact: true,
      };

      const result = reduce(initialState, search(searchForm));
      expect(_get(result, statePath).filters.length).toBe(0);
      expect(_get(result, statePath).search).toMatchObject({
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
      expect(_get(result, statePath).search.key).toBe('');
      expect(_get(result, statePath).search.value).toBe('');
      expect(_get(result, statePath).search.exact).toBe(false);
      expect(_get(result, statePath).search.not).toBe(false);
    });
  });
};
