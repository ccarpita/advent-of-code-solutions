#!/usr/bin/env node

const util = require('../util');
const input = util.inputForDay(3);

const ops = {
  '<': c => [c[0] - 1, c[1]],
  '^': c => [c[0], c[1] + 1],
  '>': c => [c[0] + 1, c[1]],
  'v': c => [c[0], c[1] - 1]
};

function commandsToLocations(cmds) {
  const locations = [[0, 0]];
  const lastLocation = () => locations[locations.length - 1];
  cmds.forEach(cmd => locations.push(ops[cmd](lastLocation())));
  return locations;
}

function uniq(arr) {
  const seen = {};
  return arr.filter(v => {
    const serial = v.toString ? v.toString() : v;
    if (!seen[serial]) {
      seen[serial] = true;
      return true;
    }
    return false;
  });
}

function algo(input, withRobo) {
  // Santa starts at (0, 0) and gets directions in input (char stream)
  // How many houses does the fat man visit?

  // 1. Transform stream of chars into an array of coords
  // 2. Count unique values

  const commands = input.split('')
    .filter(c => c in ops);

  if (!withRobo) {
    return uniq(commandsToLocations(commands)).length;
  }

  const commandSet = [
    commands.filter((c, i) => i % 2 === 0),
    commands.filter((c, i) => i % 2 !== 0)
  ];

  return uniq(commandSet
    .map(commandsToLocations)
    .reduce((acc, next) => acc.concat(next))
  ).length;
}

if (require.main === module) {
  console.log('houses visited', algo(input, false));
  console.log('houses visited with robo', algo(input, true));
}
module.exports = algo;
