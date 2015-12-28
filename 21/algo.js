#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(21);

const headerRegex = /^\>(.*):/;
const itemRegex = /^(.*?)\s+(\d+)\s+(\d+)\s+(\d+)/
const statRegex = /^(.*): (\d+)$/;

function normalize(str) {
  const norm = str.toLowerCase();
  if (norm === 'hit points') {
    return 'hp';
  }
  return norm;
}

function parseLine(line) {

  const im = line.match(itemRegex);
  if (im) {
    return {
      type: 'item',
      name: im[1],
      cost: Number(im[2]),
      damage: Number(im[3]),
      armor: Number(im[4])
    };
  }

  const hm = line.match(headerRegex);
  if (hm) {
    return {
      type: 'header',
      value: normalize(hm[1])
    };
  }

  const sm = line.match(statRegex);
  if (sm) {
    const norm = normalize(sm[1]);
    return {
      type: 'stat',
      name: normalize(sm[1]),
      value: Number(sm[2])
    }
  }
}

function parseGame(input) {
  let header = null;
  const game = {
    rings: {},
    armor: {},
    weapons: {},
    boss: {},
    player: {}
  };
  input.split('\n')
    .map(parseLine)
    .filter(t => t)
    .forEach(token => {
      if (token.type === 'header') {
        header = token.value;
      } else if (token.type === 'item') {
        assert(header, 'header is set');
        game[header][token.name] = {
          name: token.name,
          cost: token.cost,
          damage: token.damage,
          armor: token.armor
        };
      } else if (token.type === 'stat') {
        game[header][token.name] = token.value;
      }
    });
  return game;
}


function whoWins(game, playerDamage, playerDefense) {
  let playerHpDamage = game.boss.damage - playerDefense;
  if (playerHpDamage <= 0) playerHpDamage = 1;
  let bossHpDamage = playerDamage - game.boss.armor;
  if (bossHpDamage <= 0) bossHpDamage = 1;

  const roundsToKillBoss = Math.ceil(1.0 * game.boss.hp / bossHpDamage);
  const roundsToKillPlayer = Math.ceil(1.0 * game.player.hp / playerHpDamage);
  return roundsToKillBoss <= roundsToKillPlayer ? 'player' : 'boss';
}

function values(obj) {
  return Object.keys(obj).map(k => obj[k]);
}

function pairs(arr) {
  const cs = [];
  for (let i = 0, l = arr.length; i < (l - 1); i++) {
    for (let j = i + 1; j < l; j++) {
      cs.push([arr[i], arr[j]]);
    }
  }
  return cs;
}

function cartesianProduct() {
  const rest = Array.prototype.slice.call(arguments);
  const first = rest.shift();
  const product = [];
  if (rest.length) {
    const restCartesian = cartesianProduct.apply(null, rest);
    first.forEach(item => {
      restCartesian.forEach(set => {
        product.push([item].concat(set));
      });
    });
  } else {
    return first;
  }
  return product;
}

function algo(input, predicate, reducer) {
  const game = parseGame(input);

  const combos = cartesianProduct(
    values(game.weapons),
    [null].concat(values(game.armor)),
    [null].concat(values(game.rings))
          .concat(pairs(values(game.rings)))
  );

  const getSum = (items, attr) => {
    return util.flatten(items)
      .filter(item => item && item[attr] > 0)
      .map(item => item[attr])
      .reduce((acc, n) => acc + n, 0);
  }

  const whoWinsCombo = combo => {
    const playerDamage = getSum(combo, 'damage');
    const playerArmor = getSum(combo, 'armor');
    return whoWins(game, playerDamage, playerArmor);
  }

  const totalCost = combo => getSum(combo, 'cost');

  return combos.map(c => { return {
    combo: c,
    whoWins: whoWinsCombo(c),
    totalCost: totalCost(c),
    playerDamage: getSum(c, 'damage'),
    playerArmor: getSum(c, 'armor'),
  }}).filter(predicate)
     .reduce(reducer, null)
}

if (require.main === module) {
  console.log('min cost to beat boss', algo(
    input,
    c => c.whoWins === 'player',
    (acc, n) => !acc || n.totalCost < acc.totalCost ? n : acc
  ));
  console.log('max cost for boss to win', algo(
    input,
    c => c.whoWins === 'boss',
    (acc, n) => !acc || n.totalCost > acc.totalCost ? n : acc
  ));
  // 183 too low
  // 296 too high
}
module.exports = algo;
