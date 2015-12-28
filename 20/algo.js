#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = 33100000;

function algo(input, multiplier, maxWindow) {
  const buffer = [];
  const log = util.benchReport(5000, ['elves x' + multiplier + ' window=' + maxWindow]);
  for (let i = 2; i <= input / 2; i++) {
    for (let j = 1; !maxWindow || j <= maxWindow; j++) {
      const pos = i * j;
      if (pos > input / 2) {
        break;
      }
      if (!buffer[pos]) {
        // Count the first elf, since we start with i=2
        buffer[pos] = multiplier;
      }
      buffer[pos] += multiplier * i;
    }
    log(i, buffer[i]);
    if (buffer[i] >= input) {
      return i;
    }
  }
  return null;
}

if (require.main === module) {
  const solnA = algo(input, 10, 0);
  console.log('answer:10:0', solnA);
  assert.equal(solnA, 776160);
  console.log('answer:11:50', algo(input, 11, 50));
  // too high: 3009091
}
