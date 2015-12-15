#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(12);

function tokenize(input, parent) {
  if (typeof input === 'number') {
    return [{
      parent: parent,
      type: Number,
      value: input
    }]
  } else if (typeof input === 'string') {
    return [{
      parent: parent,
      type: String,
      value: input
    }]
  } else if (typeof input === 'object') {
    if (typeof input.length === 'number') {
      const token = {
        parent: parent,
        type: Array,
        value: input
      };
      let comb = [token];
      input.map(element => tokenize(element, token))
        .forEach(arr => comb = comb.concat(arr));
      return comb;
    } else {
      const token = {
        parent: parent,
        type: Object,
        value: input
      }
      let comb = [token];
      Object.keys(input)
        .map(k => tokenize(input[k], token))
        .forEach(arr => comb = comb.concat(arr));
      return comb;
    }
  }
  return [];
}

function objectHasValue(obj, val) {
  return Object.keys(obj)
    .map(k => obj[k])
    .filter(v => v === val)
    .length > 0;
}

function hasRed(token) {
  let parent = token.parent;
  while (parent) {
    if (parent.type === Object && objectHasValue(parent.value, "red")) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}

function test() {
  const tokens = tokenize(JSON.parse(input));
  assert.equal(tokens.filter(t => t.type === Object).length, 471);
  assert.equal(tokens.filter(t => t.type === Array).length, 466);
}

function algo(input, noRed) {
  return tokenize(JSON.parse(input))
    .filter(t => t.type === Number)
    .filter(t => noRed ? !hasRed(t) : true)
    .map(t => t.value)
    .reduce((acc, n) => acc + n, 0);
}

if (require.main === module) {
  console.log('answer', algo(input));
  console.log('answer', algo(input, true));
}
module.exports = algo;
