#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = '1321131112';

function lookSay(numStr) {
  let acc = '';
  for (let i = 0; i < numStr.length;) {
    let streak = 1;
    for (let j = i + 1; j < numStr.length && numStr[j] === numStr[i]; j++) {
       streak++;
    }
    acc = acc + streak + numStr[i];
    i += streak;
  }
  return acc;
}

function algo(input, n) {
  let current = String(input);
  for (let i = 0; i < n; i++) {
    current = lookSay(current);
  }
  return current.length;
}

function test() {
  assert.equal('11', lookSay('1'));
  assert.equal('112211', lookSay('1221'));
}

if (require.main === module) {
  console.log('length of result (n=40)', algo(input, 40));
  console.log('length of result (n=50)', algo(input, 50));
}
module.exports = algo;
