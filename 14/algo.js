#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(14);

const parse = util.parser(
  /(.*) can fly (\d+) km\/s for (\d+) seconds, but then must rest for (\d+) seconds/,
  ['name', 'speed', 'on', 'off'],
  item => {
    return {
      name: item.name,
      speed: Number(item.speed),
      on: Number(item.on),
      off: Number(item.off),
    }
  }
);

function distanceAfter(r, numSeconds) {
  const iters = Math.floor(numSeconds / (r.on + r.off));
  const remain = (numSeconds % (r.on + r.off));
  return iters * r.on * r.speed
    + (remain > r.on ? r.on * r.speed : remain * r.speed);
}

/**
 * Given a list of reindeer, total seconds, and scoring style,
 * return a map of reindeer name to total points
 *
 * @param {Array<Object>} reindeer Array of reindeer (players)
 * @param {Number} numSeconds Total number of seconds
 * @param {String} scoringStyle One of: "distance", "points"
 */
function runRace(reindeer, numSeconds, scoringStyle) {
  const score = {};
  reindeer.forEach(r => score[r.name] = 0);
  const distance = r => distanceAfter(r, numSeconds);
  for (let i = 1; i <= numSeconds; i++) {
    const scored = reindeer
      .map(r => [r, distanceAfter(r, i)])

    if (scoringStyle === 'points') {
      const lead = scored.reduce((w, sr) => {
        return (!w || sr[1] > w[1]) ? sr : w;
      }, null);
      score[lead[0].name]++;
    } else if (i === numSeconds) {
      scored
        .forEach(sr => score[sr[0].name] = sr[1]);
    }
  }
  return score;
}

function algo(input, numSeconds, scoringStyle) {

  const reindeer = input.split('\n')
    .filter(util.identity)
    .map(parse);

  return runRace(reindeer, numSeconds, scoringStyle);
}


if (require.main === module) {
  console.log('race results', algo(input, 2503));
  console.log('race results (points)', algo(input, 2503, 'points'));
}
module.exports = algo;
