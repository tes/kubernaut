import reduce, {
  fetchVersion,
  FETCH_VERSION_REQUEST,
  FETCH_VERSION_SUCCESS,
  FETCH_VERSION_ERROR,
} from '../secretVersion';

describe('SecretVersion reducer', () => {
  it('should initialise page data with default state', () => {
    const defaultState = reduce(undefined, {});
    const state = reduce(undefined, fetchVersion());
    expect(state).toMatchObject(defaultState);
  });

  it('should set relevant loading state when requesting version', () => {
    const state = reduce(undefined, FETCH_VERSION_REQUEST());
    expect(state.meta.loading).toMatchObject({
      sections: { version: true },
    });
  });

  it('should update state when version have loaded', () => {
    const data = { comment: 'abc', service: { id: 123, name: 'abc' } };
    const state = reduce(undefined, FETCH_VERSION_SUCCESS({ data }));
    expect(state.version).toBe(data);
    expect(state.meta.loading).toMatchObject({
      sections: { version: false },
    });
  });

  it('should update state when version have errored', () => {
    const state = reduce(undefined, FETCH_VERSION_ERROR({ error: 'Oh Noes' }));
    expect(state.meta).toMatchObject({
      loading: {
        sections: {
          version: false,
        },
      },
      error: 'Oh Noes',
    });
  });
});
