#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(8);

const hexes = (function(inputString) {
  const h = {};
  inputString.split('')
    .filter(c => c)
    .forEach(c => h[c] = true);
  return h
}('0123456789abcdefABCDEF'));

function numChars(str) {
  let count = 0;
  for (let i = 1; i < (str.length - 1);) {
    let repLength = 1;
    if (str[i] === '\\') {
      if (str[i + 1] === 'x' && (str[i + 2] in hexes) && (str[i + 3] in hexes)) {
        repLength = 4;
      } else if (str[i + 1]) {
        repLength = 2;
      }
    }
    i += repLength;
    count++;
  }
  return count;
}

const escaped = {'"': true, '\\': true};

function encode(str) {
  const buffer = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] in escaped) {
      buffer.push('\\');
    }
    buffer.push(str[i])
  }
  return '"' + buffer.join('') + '"';
}

function algo(input, measure) {
  const diffDecode = str => str.length - numChars(str);
  const diffEncode = str => encode(str).length - str.length;
  const diff = measure === 'encode' ? diffEncode : diffDecode;
  const valid = str => str && str[0] === '"' && str[str.length - 1] === '"';

  return input.split("\n")
    .filter(valid)
    .map(diff)
    .reduce((acc, d) => acc + d, 0);
}

function test() {
  assert.equal(numChars('""'), 0);
  assert.equal(numChars('"\\""'), 1);
  assert.equal(numChars('"\\xFFe"'), 2);
}

if (require.main === module) {
  test();
  console.log('decode:', algo(input, 'decode'));
  console.log('encode:', algo(input, 'encode'));
}
module.exports = algo;
