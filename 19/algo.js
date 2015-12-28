#!/usr/bin/env node
  //    next: Array<Node>,

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(19);

const mapRegex = /(.*) => (.*)/;
function parseLine(line) {
  const match = line.match(mapRegex);
  if (match) {
    return {
      type: 'map',
      from: match[1],
      to: match[2]
    };
  }
  if (line && line.length > 100) {
    return {
      type: 'medicine',
      value: line
    };
  }
};

const maxKeyLen = util.memoize(obj => {
  return Object.keys(obj)
    .reduce((max, k) => k.length > max ? k.length : max, 0);
});

/**
 * Given a string and length, generate a list of n-grams where n < length.
 * Each gram will have the shape:
 * {
 *   pos: number,
 *   gram: str
 * }
 */
function grams(mappings, str) {
  const gramLen = maxKeyLen(mappings);
  const g = [];
  const l = str.length;
  for (let i = 0; i < l; i++) {
    for (let j = 1; j <= gramLen && (i + j) <= l; j++) {
      const gram = str.substr(i, j);
      if (mappings[gram]) {
        g.push({
          pos: i,
          gram: gram
        });
      }
    }
  }
  return g;
}

function spliceString(str, pos, len, withStr) {
  const repl = str.substring(0, pos)
    + withStr
    + str.substring(pos + len, str.length);
  return repl;
}

function replacements(str, mappings, gram) {
  if (!mappings[gram.gram]) {
    return [];
  }

  const splice = util.curry(
    spliceString,
    [str, gram.pos, gram.gram.length]
  );

  return mappings[gram.gram]
    .map(splice)
}


function nextSteps(mappings, molecule) {

  const uniq = {};
  const addUniqs = strs => strs.forEach(str => uniq[str] = true);

  grams(mappings, molecule)
    .map(util.curry(replacements, [molecule, mappings]))
    .forEach(addUniqs);

  return Object.keys(uniq);
}

function every(num, fn) {
  let i = 0;
  return function() {
    i++;
    if (i % num === 0) {
      fn.apply(null, arguments);
    }
  }
}

/**
 * Generate a decision tree.
 */
function generateTree(mappings, molecule) {

  const log = every(100000000, node => console.log(node));

  // Since we sort next-steps by the greatest possible reduction
  // to the molecule, we know that the first result achieved is
  // the optimum, and thus can end further tree explorations.
  let done = false;

  return util.generateDecisionTree(
    (node) => done ? [] : nextSteps(mappings, node.value)
      .sort((a, b) => a.length - b.length),
    (node) => {
      if (node.value === 'HF' || node.value === 'NAl' || node.value == 'OMg') {
        done = true;
        return true;
      }
      return false;
    },
    (a, b) => b.depth - a.depth,
    molecule
  );
}

function algo(input, mode) {
  const data = input.split('\n')
    .map(parseLine)
    .filter(d => d);

  const inputMaps = data.filter(m => m.type === 'map');

  const mappings = util.collectMultiMap(
    inputMaps.map(item => [item.from, item.to])
  );

  const reverseMappings = util.collectMultiMap(
    inputMaps.map(item => [item.to, item.from])
      .filter(arr => arr[1] !== 'e')
  );

  const medicine = data.filter(m => m.type === 'medicine')
    .map(s => s.value)[0];

  if (!mode || mode === 'calibrate') {
    return nextSteps(mappings, medicine).length;
  }

  return generateTree(reverseMappings, medicine).optimum;
}

if (require.main === module) {
  const calibration = algo(input, 'calibrate');
  console.log('calibration', calibration);
  assert.equal(calibration, 535);
  const soln = algo(input, 'solution');
  console.log('shortest-path-soln', soln);
  console.log('shortest-path-depth', soln.depth + 1);
}
module.exports = algo;
