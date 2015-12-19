#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = `
11
30
47
31
32
36
3
1
5
3
32
36
15
11
46
26
28
1
19
3
`;


function bufferTotal(buffer, n) {
  let total = 0;
  for (let i = 0; i < buffer.length; i++) {
    if ((n >> i) & 1) {
      total += buffer[i];
    }
  }
  return total;
}

function countOnes(n) {
  let i = 0;
  let count = 0;
  while (Math.pow(2, i) < n) {
    if ((n >> i) & 1) count++;
    i++;
  }
  return count;
}

function algo(input, target, minOnly) {
  assert(target > 0);
  const buffer = input.split('\n').filter(util.identity).map(Number);
  const total = n => bufferTotal(buffer, n);
  const equalsTargetVolume = n => total(n) === target;

  const from = 1;
  const to = (1 << buffer.length) - 1;
  let solns = util.seq(from, to)
    .filter(equalsTargetVolume)
    .toArray();

  solns = solns.map(i => [i, countOnes(i)]);

  if (minOnly) {
    const min = solns.reduce(
      (acc, n) => (acc === null || n[1] < acc) ? n[1] : acc,
      null
    );
    return {
      num: solns.filter(sol => sol[1] === min).length,
      min: min
    };
  }
  return solns.length;
}

function test() {
  assert.equal(countOnes(3), 2);
  assert.equal(algo('1', 1), 1);
  assert.equal(algo('1\n1', 2), 1);
}

if (require.main === module) {
  test();
  console.log('num combinations', algo(input, 150));
  console.log('using min containers', algo(input, 150, true));
  // too low: 2217
}
module.exports = algo;
