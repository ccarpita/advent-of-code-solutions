#!/usr/bin/env node

'use strict';

const util = require('../util');
const input = util.inputForDay(2);

// Transform array of items into an array of all
// pair-wise combinations of items
// [1, 2, 3] -> [[1, 2], [1, 3], [2, 3]]
function pairs(arr) {
  const c = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      c.push([arr[i], arr[j]]);
    }
  }
  return c;
}

function product(arr) {
  return arr.reduce((acc, next) => acc * next, 1);
}

function sum(arr) {
  return arr.reduce((acc, next) => acc + next, 0);
}

function min(arr) {
  return arr.reduce((acc, next) => acc < next ? acc : next, Number.MAX_SAFE_INTEGER);
}

function numericallySorted(arr) {
  const sorted = arr.slice(0);
  sorted.sort((a, b) => a - b);
  return sorted;
}

function algo(input) {
  const data = input.split("\n")
    .filter(line => line.match(/^\d+x\d+x\d+$/))
    .map(line => line.split('x').map(i => Number(i)))

  const paper = data
    .map(pairs)
    .map(pairSet => pairSet.map(product))
    .map(products => 2 * sum(products) + min(products))
    .reduce((acc, n) => acc + n, 0);


  const arr1 = [1, 2, 3, 2, 1];
  const arr2 = numericallySorted(arr1);

  const ribbon = data
    .map(numericallySorted)
    .map(s => 2 * s[0] + 2 * s[1] + product(s))
    .reduce((acc, n) => acc + n, 0);

  return {
    paper: paper,
    ribbon: ribbon
  };
}


if (require.main === module) {
  var r = algo(input);
  console.log('total paper size', r.paper);
  console.log('total ribbon size', r.ribbon);
}
module.exports = algo;

