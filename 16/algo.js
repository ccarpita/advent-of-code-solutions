#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(16);


const firstAnalysis =
`children: 3
cats: 7
samoyeds: 2
pomeranians: 3
akitas: 0
vizslas: 0
goldfish: 5
trees: 3
cars: 2
perfumes: 1
`;

const parseLine = util.parser(/Sue (\d+): (.*)/, ['which:number', 'spec']);

function parse(line) {
  const item = parseLine(line);
  const pairs = item.spec.split(', ')
    .map(pair => pair.split(': '));
  return {
    which: item.which,
    attributes: util.collectMap(pairs, (_, n) => Number(n))
  };
}


function parseAnalysis(analysis) {
  const pairs = analysis.split('\n')
    .filter(util.identity)
    .map(l => l.split(': '))
  return util.collectMap(pairs, (c, n) => Number(n));
}

function matchesAnalysis(analysisMap, aunt, comparator) {
  return util.keyValues(aunt.attributes)
    .filter(kv => !comparator(kv[0], analysisMap[kv[0]], kv[1]))
    .length === 0;
}

function algo(input, analysis, comparator) {
  const analysisMap = parseAnalysis(analysis);
  const match = aunt => matchesAnalysis(
    analysisMap,
    aunt,
    comparator ? comparator : (k, a, v) => a === v
  );

  return input.split('\n')
    .filter(util.identity)
    .map(parse)
    .filter(match);
}

if (require.main === module) {
  console.log('answer', algo(input, firstAnalysis));
  console.log('answer with ranges', algo(input, firstAnalysis, (k, a, v) => {
    if (k === 'cats' || k === 'trees') {
      return v > a;
    }
    if (k === 'pomeranians' || k === 'goldfish') {
      return v < a;
    }
    return v === a;
  }));
}
module.exports = algo;
