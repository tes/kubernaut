import { parse, stringify as makeQueryString } from 'query-string';
export {
  parse as parseQueryString,
  stringify as makeQueryString
} from 'query-string';

export const extractFromQuery = (currentQueryString, prop) => (parse(currentQueryString)[prop]);
export const alterQuery = (currentQueryString, changes) => {
  const query = parse(currentQueryString);
  const newQuery = { ...query, ...changes };
  return makeQueryString(newQuery);
};
