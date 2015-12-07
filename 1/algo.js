#!/usr/bin/env node

const util = require('../util');
const input = util.inputForDay(1);

const op = {
  '(': x => x + 1,
  ')': x => x - 1
};

const basementIdx = [];
function checkBasement(result, prev, idx) {
  if (prev === 0 && result === -1) {
    basementIdx.push(idx);
  }
  return result;
}

function algo() {
  return input.split('')
    .filter(c => c in op)
    .map(c => op[c])
    .reduce((acc, fn, idx) => checkBasement(fn(acc), acc, idx), 0)
}

if (require.main === module) {
  console.log('final floor: ', algo());
  console.log('first basement char: ', basementIdx[0] + 1);
}
module.exports = algo;
