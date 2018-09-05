import reduce, {
  FETCH_SERVICES_REQUEST,
  FETCH_SERVICES_SUCCESS,
  FETCH_SERVICES_ERROR,
  toggleSort,
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
});
