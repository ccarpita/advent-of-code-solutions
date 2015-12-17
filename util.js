'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

function inputForDay(day) {
  return fs.readFileSync(path.join(__dirname, String(day), 'input'), 'utf-8');
}
exports.inputForDay = inputForDay;

function md5hex(str) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}

exports.md5hex = md5hex;

exports.seq = require('./seq');

function parser(regex, fields, transform) {
  assert(typeof regex.test === 'function');
  assert(fields.length);
  assert(!transform || typeof transform === 'function');
  return function(line) {
    const match = line.match(regex);
    if (!match) {
      throw new Error("parse error: " + line);
    }
    const item = {};
    for (let i = 0; i < fields.length; i++) {
      item[fields[i]] = match[i + 1];
    }
    return transform ? transform(item) : item;
  }
}
exports.parser = parser;

exports.identity = (id) => id;

