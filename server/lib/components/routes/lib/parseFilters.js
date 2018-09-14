import qs from 'querystring';

const _parseFilter = (query) => {
  const { value, exact = false, not = false } = qs.parse(query, ',', ':');
  return {
    value,
    exact: exact === 'true',
    not: not === 'true',
  };
};
export default (query, filterNames) => {
  return filterNames.reduce((acc, name) => {
    if(!query[name]) return acc;
    if(!Array.isArray(query[name])) {
      return {
        ...acc,
        [name]: [_parseFilter(query[name])],
      };
    }
    return {
      ...acc,
      [name]: query[name].map(_parseFilter),
    };
  }, {});
};
