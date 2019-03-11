import sqb from 'sqb';
import { v4 as uuid } from 'uuid';
import Promise from 'bluebird';
const { Op, raw } = sqb;

import AuditEntry from '../../domain/AuditEntry';

export default function(options) {

  function start({ config, logger, db }, cb)  {



    return cb(null, {

    });
  }

  return {
    start,
  };
}
