import expect from 'expect';
import parse from './parseFilters';
import { stringify } from 'querystring';

const stringifyParams = [',', ':'];

describe('parseFilters lib', () => {
  it('parses a plain query into filters', () => {
    const query = {
      bob: 'abc',
      robert: 'something',
    };

    const filters = parse(query, ['bob', 'robert']);
    expect(Object.keys(filters)).toMatchObject(['bob', 'robert']);
    expect(filters.bob).toMatchObject([{
      value: query.bob,
      exact: true,
      not: false,
    }]);
    expect(filters.robert).toMatchObject([{
      value: query.robert,
      exact: true,
      not: false,
    }]);
  });

  it('parses valid full complexity filter options', () => {
    const query = {
      bob: stringify({ value: 'abc', exact: false, not: true }, ...stringifyParams),
    };

    const filters = parse(query, ['bob']);
    expect(filters.bob).toMatchObject([{
      value: 'abc',
      exact: false,
      not: true,
    }]);
  });

  it('only parses requested properties of a query', () => {
    const query = {
      bob: 'abc',
      robert: 'something',
    };

    const filters = parse(query, ['bob']);
    expect(Object.keys(filters)).toMatchObject(['bob']);
    expect(filters.bob).toMatchObject([{
      value: query.bob,
      exact: true,
      not: false,
    }]);
  });

  it('parses multiple filters by the same name', () => {
    const query = {
      bob: [
        stringify({ value: 'abc' }, ...stringifyParams),
        stringify({ value: '123', not: true }, ...stringifyParams)
      ],
    };

    const filters = parse(query, ['bob']);
    expect(Object.keys(filters)).toMatchObject(['bob']);
    expect(filters.bob).toMatchObject([
      { value: 'abc', exact: true, not: false },
      { value: '123', exact: true, not: true },
    ]);
  });

  it('accepts a value in a filter to be an array', () => {
    const query = {
      bob: [
        stringify({ value: ['abc', '123'] }, ...stringifyParams),
      ],
    };

    const filters = parse(query, ['bob']);
    expect(Object.keys(filters)).toMatchObject(['bob']);
    expect(filters.bob).toMatchObject([
      { value: ['abc', '123'], exact: true, not: false },
    ]);
  });

  it('uses a map to rename', () => {
    const query = {
      bob: 'abc',
      robert: 'something',
    };

    const filters = parse(query, ['bob', 'robert'], { robert: 'jeff' });
    expect(Object.keys(filters)).toMatchObject(['bob', 'jeff']);
    expect(filters.bob).toMatchObject([{
      value: query.bob,
      exact: true,
      not: false,
    }]);
    expect(filters.jeff).toMatchObject([{
      value: query.robert,
      exact: true,
      not: false,
    }]);
  });
});
