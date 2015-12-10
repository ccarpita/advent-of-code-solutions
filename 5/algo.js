#!/usr/bin/env node

'use strict';

const assert = require('assert');
const util = require('../util');
const input = util.inputForDay(5);

function fill(arr, def) {
  const o = {};
  arr.forEach(i => o[i] = def);
  return o;
}

const vowelMap = fill(chars('aeiou'), true);
const badStrings = 'ab,cd,pq,xy'.split(',');

function isVowel(c) {
  return c in vowelMap;
}

function chars(word) {
  return word.split('').filter(c => c);
}

function numVowels(word) {
  return chars(word)
    .filter(isVowel)
    .length;
}

function hasRepeat(word, dist) {
  dist = dist || 1;
  return chars(word)
    .map((c, i) => [c, word[i + dist]])
    .filter(cc => cc[0] === cc[1])
    .length > 0;
}

function containsNoBadString(word) {
  return badStrings
    .filter(str => word.indexOf(str) >= 0)
    .length === 0;
}

/**
 * Like the shell `uniq` script, remove duplicate sequential items
 * in the given array
 */
function uniq(arr) {
  let last = null;
  return arr.filter(i => {
    if (i === last) {
      return false;
    }
    last = i;
    return true;
  });
}

function pairAppearsTwice(word) {
  const l = word.length;
  const pairs = chars(word)
      .filter((c, i) => i < l - 1)
      .map((c, i) => c + word[i + 1]);
  const freq = uniq(pairs)
    .reduce((acc, pair) => {
      acc[pair] = acc[pair] || 0;
      acc[pair]++;
      return acc;
    }, {});
  return Object.keys(freq)
    .filter(k => freq[k] > 1)
    .length > 0;
}

function oldNice(word) {
  return numVowels(word) >= 3
    && hasRepeat(word)
    && containsNoBadString(word)
}

function newNice(word) {
  return hasRepeat(word, 2)
    && pairAppearsTwice(word);
}

function algo(method, input) {
  return input.split("\n")
    .filter(method)
    .length;
}

if (require.main === module) {
  console.log('old-nice answer', algo(oldNice, input));
  console.log('new-nice answer', algo(newNice, input));
}
module.exports = algo;
