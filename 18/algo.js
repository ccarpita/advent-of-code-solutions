#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(18);

const WIDTH = 100;

const NEIGHBOR_COORD =
  util.flatten(
    util.range(-1, 1)
    .map(
      y => util.range(-1, 1)
               .map(x => [y, x])
    )
  ).filter(c => c[0] !== 0 || c[1] !== 0);

function isValidCoord(coord) {
  return coord
    .filter(n => n >= 0 && n < WIDTH)
    .length === 2;
}


function neighbors(mtx, y, x) {
  return NEIGHBOR_COORD
    .map(c => [c[0] + y, c[1] + x])
    .filter(isValidCoord)
    .map(c => mtx[c[0]][c[1]]);
}

function parseLine(line) {
  return line ? line.split('')
    .filter(c => c === '.' || c === '#')
    .map(c => c === '.' ? 0 : 1) : null;
}

function eachCoord(mtx, fn) {
  const len = mtx.length;
  for (let y = 0; y < len; y++) {
    const rowLen = mtx[y].length;
    for (let x = 0; x < rowLen; x++) {
      fn(y, x, mtx[y][x]);
    }
  }
}

function allValues(mtx) {
  const all = [];
  eachCoord(mtx, (i, j, v) => {
    all.push(v);
  });
  return all;
}

function setVal(mtx, i, j, val) {
  mtx[i] = mtx[i] || [];
  mtx[i][j] = val;
}

function nextMatrix(mtx, mapFn) {
  const next = [];
  const setCoord = (i, j, v) => setVal(
    next,
    i, j,
    mapFn(i, j, v, neighbors(mtx, i, j))
  );
  eachCoord(mtx, setCoord);
  return next;
}

function nextValue(y, x, currentValue, neighbors) {
  const numOn = neighbors.filter(v => v).length;
  if (currentValue) {
    return numOn === 3 || numOn === 2 ? 1 : 0;
  }
  return numOn === 3 ? 1 : 0;
}

function isCorner(y, x) {
  return [y, x]
    .filter(n => n === 0 || n === WIDTH - 1)
    .length === 2;
}

function nextValueStuckCorners(y, x, currentValue, neighbors) {
  if (isCorner(y, x)) {
    return 1;
  }
  return nextValue(y, x, currentValue, neighbors);
}

function algo(input, iterations, mapFn, initFn) {
  assert(iterations > 0);

  const mtx = input.split('\n')
    .map(parseLine)
    .filter(l => l);
  assert.equal(mtx.length, 100);

  if (initFn) {
    initFn(mtx);
  }

  const history = [mtx];
  for (let i = 0; i < iterations; i++) {
    history.push(
      nextMatrix(history[history.length - 1], mapFn)
    );
  }

  return allValues(history[history.length - 1])
    .filter(v => v === 1)
    .length;
}

if (require.main === module) {
  console.log('number of 1s:', algo(input, 100, nextValue));
  console.log('number of 1s (stuck corners)', algo(input, 100, nextValueStuckCorners, mtx => {
    setVal(mtx, 0, 0, 1);
    setVal(mtx, 0, WIDTH - 1, 1);
    setVal(mtx, WIDTH - 1, 0, 1);
    setVal(mtx, WIDTH - 1, WIDTH - 1, 1);
  }));
  // too low: 861
}
module.exports = algo;
