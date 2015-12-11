#!/usr/bin/env node

'use strict';

const util = require('../util');
const input = util.inputForDay(6);

const assert = require('assert');

const PARSE_REGEX = /^(turn off|toggle|turn on) (\d+,\d+) through (\d+,\d+)/;

function parse(line) {
  const m = line.match(PARSE_REGEX);
  if (!m) {
    return null;
  }
  return {
    type: m[1],
    from: m[2].split(',').map(Number),
    to: m[3].split(',').map(Number)
  };
}

function ok(item) {
  return !!item;
}

function coordIter(from, to, fn) {
  for (let i = from[0]; i <= to[0]; i++) {
    for (let j = from[1]; j <= to[1]; j++) {
      fn([i, j]);
    }
  }
}

function createMatrix(n, def) {
  const mtx = [];
  coordIter([0, 0], [n - 1, n - 1], c => {
    mtx[c[0]] = mtx[c[0]] || [];
    mtx[c[0]][c[1]] = def;
  });
  return mtx;
}

function result(commandType, currentValue, commandVersion) {
  switch (commandType + ':' + (commandVersion || 1)) {
    case 'turn on:1':
      return 1;
    case 'turn on:2':
      return 1 + currentValue;
    case 'turn off:1':
      return 0;
    case 'turn off:2':
      return Math.max(currentValue - 1, 0);
    case 'toggle:1':
      return currentValue ? 0 : 1;
    case 'toggle:2':
      return currentValue + 2;
    default:
      throw new Error('unrecognized command/version: ' + commandType + ':' + commandVersion);
  }
}

function set(matrix, coord, value) {
  matrix[coord[0]][coord[1]] = value;
}

function get(matrix, coord) {
  return matrix[coord[0]][coord[1]];
}

function processor(matrix, commandVersion) {
  return command => {
    coordIter(command.from, command.to, coord => {
      const v = result(command.type, get(matrix, coord), commandVersion);
      set(matrix, coord, v);
    });
  };
}

function numLightsOn(matrix) {
  return matrix.reduce((acc, row) => {
    acc += row.reduce((racc, i) => racc += (i || 0))
    return acc;
  }, 0);
}

function algo(input, commandVersion) {
  const matrix = createMatrix(1000, 0);

  input.split("\n")
    .map(parse)
    .filter(ok)
    .forEach(processor(matrix, commandVersion));

  return numLightsOn(matrix);
}

if (require.main === module) {
  console.log('answer-part-1', algo(input));
  console.log('answer-part-2', algo(input, 2));
}
module.exports = algo;
