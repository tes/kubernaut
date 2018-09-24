import qs from 'querystring';

const _parseFilter = (query) => {
  const parsed = qs.parse(query, ',', ':');
  const value = ({}).hasOwnProperty.call(parsed, 'value') ? parsed.value : query;
  const exact = ({}).hasOwnProperty.call(parsed, 'exact') ? parsed.exact : true;
  const not = ({}).hasOwnProperty.call(parsed, 'not') ? parsed.not : false;

  const filter = {
    value,
    exact: typeof(exact) === 'boolean' ? exact : exact === 'true',
    not: typeof(not) === 'boolean' ? not: not === 'true',
  };

  return filter;
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
