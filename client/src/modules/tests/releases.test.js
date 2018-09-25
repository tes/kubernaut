import reduce, * as allExports from '../releases';
import filterTests from './lib/filterTests';
const {
  FETCH_RELEASES_REQUEST,
  FETCH_RELEASES_SUCCESS,
  FETCH_RELEASES_ERROR,
  toggleSort,
} = allExports;

describe('Releases Reducer', () => {

  it('should indicate when releases are loading', () => {
    const state = reduce(undefined, FETCH_RELEASES_REQUEST());
    expect(state.data).toMatchObject({});
    expect(state.meta).toMatchObject({ loading: true });
  });

  it('should update state when releases have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_RELEASES_SUCCESS({ data: { limit: 50, offset: 0, count: 3, items: [1, 2, 3] } }));
    expect(state.data.limit).toBe(50);
    expect(state.data.offset).toBe(0);
    expect(state.data.count).toBe(3);
    expect(state.data.items).toMatchObject([1, 2, 3]);
    expect(state.meta).toMatchObject({});
  });

  it('should update state when releases have loaded', () => {
    const initialState = {
      data: [],
      meta: {
        loading: true,
      },
    };
    const state = reduce(initialState, FETCH_RELEASES_ERROR({ error: 'Oh Noes' }));
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

  filterTests(allExports);
});
