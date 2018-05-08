import { promiseApi } from 'cryptus';

export default function() {

  function start({ config }, cb) {
    cb(null, promiseApi());
  }

  return {
    start,
  };
}
