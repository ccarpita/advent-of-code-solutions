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
      const nameFormat = fields[i].split(':');
      let val = match[i + 1];
      if (nameFormat[1] === 'number') {
        val = Number(val);
      }
      item[nameFormat[0]] = val;
    }
    return transform ? transform(item) : item;
  }
}
exports.parser = parser;

exports.identity = (id) => id;

function traceFn(fn, name) {
  return function() {
    const res = fn.apply(null, arguments);
    console.log(name || '(debug)', arguments, '=>', res);
    return res;
  }
}
exports.traceFn = traceFn;

/**
 * Given an array of 2-element arrays, collect the results into a plain
 * object where the first item of each pair is a key.  Later elements
 * will override earlier elements with the same key, unless a reducer
 * is specified.
 * @param {Array<Array<>.length==2>}
 * @param {Function} reduceFn
 */
function collectMap(arr, reduceFn) {
  const reduceValue = reduceFn ? reduceFn : (current, next) => next;
  return arr.reduce((acc, n) => {
    acc[n[0]] = reduceValue(acc[n[0]], n[1]);
    return acc;
  }, {});
}
exports.collectMap = collectMap;

function keyValues(obj) {
  return Object.keys(obj)
    .map(k => [k, obj[k]]);
}
exports.keyValues = keyValues;

