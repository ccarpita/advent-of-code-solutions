#!/usr/bin/env node

// Expectations:
// abcdef -> 609043
// Too high: 729221
//   md5hex(abcdef609043) starts with 5 zeros (000001dbbfa)

var day4Input = 'ckczppom';
var util = require('../util');
var seq = util.seq;
var md5hex = util.md5hex;

function nchars(n, char) {
  return new Array(n + 1).join(char);
}

function algo(seed, numZeros) {
  const prefix = nchars(numZeros, '0');
  return seq(1)
    .filter(i => md5hex(seed + i).startsWith(prefix))
    .first();
}

if (require.main === module) {
  const input = process.argv[2] || day4Input;
  console.log('5-zeroes for ' + input, algo(input, 5));
  console.log('6-zeroes for ' + input, algo(input, 6));
}
module.exports = algo;
