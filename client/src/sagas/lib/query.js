import { parse, stringify as makeQueryString } from 'querystring';
export {
  parse as parseQueryString,
  stringify as makeQueryString
} from 'querystring';

const cleanParse = (querystring) => (parse(querystring.match(/\??(.*)/)[1]));
export const extractFromQuery = (currentQueryString, prop) => (cleanParse(currentQueryString)[prop]);
export const alterQuery = (currentQueryString, changes) => {
  const query = cleanParse(currentQueryString);
  const newQuery = { ...query, ...changes };
  return makeQueryString(newQuery);
};
