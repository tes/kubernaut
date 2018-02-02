#!/usr/bin/env node

/* eslint-disable no-console */

const callbackApi = require('cryptus').callbackApi;
const cryptus = callbackApi();
const uuid = require('uuid').v4;

const token = uuid();
const key = process.argv[2];
const timeout = setTimeout(function() {}, 5000);

if (!key) {
  console.error('Please specify a key');
  process.exit(1);
}

cryptus.encrypt(key, token, (err, encrypted) => {
  if (err) throw err;
  console.log('Identity (store in database): ', token);
  console.log('Bearer Token (use in HTTP requests): ', new Buffer(encrypted).toString('base64'));
  clearTimeout(timeout);
});
