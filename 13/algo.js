#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(13);

const inputRegex = /(.*) would (gain|lose) (\d+) happiness units by sitting next to (.*)\./;

function parse(line) {
  const match = line.match(inputRegex);
  if (!match) {
    throw new Error("invalid line: " + line);
  }
  return {
    who: match[1],
    delta: Number(match[3]) * (match[2] === 'gain' ? 1 : -1),
    neighbor: match[4]
  }
}

function getScoreMap(input) {
  return input.split("\n")
    .filter(l => l)
    .map(parse)
    .reduce((scoreMap, spec) => {
      scoreMap[spec.who] = scoreMap[spec.who] || {};
      scoreMap[spec.who][spec.neighbor] = spec.delta;
      return scoreMap;
    }, {});
}

function neighbors(order, i) {
  const len = order.length;
  if (len < 2) {
    return [];
  }
  if (len === 2) {
    return [order[i + 1 >= len ? 0 : i +1]];
  }
  const next = i + 1 >= len ? 0 : i + 1;
  const prev = i - 1 < 0 ? (len - 1) : i - 1;
  return [order[prev], order[next]].sort();
}

function getUniqueOrderings(forWhom) {
  const len = forWhom.length;
  if (len === 1) {
    return forWhom.slice(0);
  }

  const hasSeen = {};
  const orderings = [];

  for (let i = 0; i < len; i++) {
    const rest = forWhom.slice(0);
    rest.splice(i, 1);
    getUniqueOrderings(rest)
      .forEach(ord => {
        const order = [forWhom[i]].concat(ord);
        orderings.push(order);
      });
  }
  return orderings;
}

function score(scoreMap, order) {
  return order
    .map((loc, i) => {
      return neighbors(order, i)
        .map(n => scoreMap[loc][n] || 0)
        .reduce((acc, n) => acc + n, 0);
    })
    .reduce((acc, n) => acc + n, 0);
}

function algo(input) {
  const scoreMap = getScoreMap(input);

  return getUniqueOrderings(Object.keys(scoreMap))
    .map(order => [order, score(scoreMap, order)])
    .reduce((acc, pair) => {
      if (!acc || pair[1] > acc.score) {
        return {
          order: pair[0],
          score: pair[1]
        };
      }
      return acc;
    }, null);
}

if (require.main === module) {
  console.log('best result', algo(input));
  console.log('best result, including me', algo(input + "\nMe would gain 0 happiness units by sitting next to Alice."));
}
module.exports = algo;
