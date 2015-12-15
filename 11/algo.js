#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = 'hxbxwxba';

const bannedMap = (function (chars) {
  const map = {};
  chars.split('').filter(c => c).map(code)
    .forEach(num => map[num] = true);
  return map;
})('iol');

const FIRST = code('a');
const LAST = code('z');

function code(chr) {
  return chr.charCodeAt(0);
}

function toChar(code) {
  return String.fromCharCode(code);
}

function increment(buffer) {
  const incd = buffer.slice(0);
  for (let i = buffer.length - 1; i >= 0; i--) {
    incd[i]++;
    if (incd[i] <= LAST) {
      break;
    }
    incd[i] = FIRST;
  }
  return incd;
}

function bufferToString(buffer) {
  return buffer.map(toChar).join('');
}

function containsSeq(buffer, run) {
  for (let i = 0, l = buffer.length; i < l; i++) {
    const seq = [buffer[i]];
    for (let j = i + 1; j < (i + run) && j < l; j++) {
      if (buffer[j] === (buffer[j - 1] + 1)) {
        seq.push(buffer[j]);
      } else {
        break;
      }
    }
    if (seq.length === run) {
      return true;
    }
  }
  return false;
}

function numPairs(buffer) {
  const pairs = [];
  let lastPairAt = -2;
  buffer.forEach((code, i) => {
    if (code === buffer[i + 1] && i > (lastPairAt + 1)) {
      pairs.push(i);
      lastPairAt = i;
    }
  });
  return pairs.length;
}

function isValid(buffer) {
  return containsSeq(buffer, 3)
    && buffer.filter(c => c in bannedMap).length === 0
    && numPairs(buffer) >= 2;
}


function algo(input) {
  const buffer = input.split('')
    .filter(c => c)
    .map(code);

  let next = increment(buffer);
  while (!isValid(next)) {
    next = increment(next);
  }
  return bufferToString(next);
}

function test() {
  assert(!isValid('hijklmmn'))
  assert(!isValid('abbceffg'))
  assert(!isValid('abbcegjk'))
  assert.equal(algo('abcdefgh'), 'abcdffaa');
  //assert.equal(algo('ghijklmn'), 'ghjaabcc');
}

if (require.main === module) {
  test();
  const next = algo(input);
  console.log('pass[1]', next);
  console.log('pass[2]', algo(next));
}
module.exports = algo;
