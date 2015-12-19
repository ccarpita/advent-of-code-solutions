#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(15);

const ATTRIBUTES = ['capacity', 'durability', 'flavor', 'texture'];

const parse = util.parser(
  /(.*): capacity (-?\d+), durability (-?\d+), flavor (-?\d+), texture (-?\d+), calories (\d+)/,
  ['name'].concat(ATTRIBUTES.concat(['calories']).map(a => a + ':number'))
);

/**
 * Given an array of pivots which are fixed, and remaining ingredients
 * which can be varied, return the best ingredient.  All of these have
 * the following shape (IngredientAmount):
 * {
 *    quantity: numberWithRange(1, 100),
 *    ingredient: {
 *      name: string,
 *      [...ATTRIBUTES]: number
 *    }
 * }
 *
 * @param {Array<IngredientAmount>} pivot List of fixed ingredient amounts
 * @param {Array<IngredientAmount>} rest Remaining ingredient amounts which can be varied.
 * @param {Function<Array<IngredientAmount>, Number>} scoreFn Function taking array of ingredient
 *   amounts and returning a numeric score.
 * @returns {Solution} Top-scoring combination of ingredients, where Solution has the shape:
 *  { score: number, ingredients: Array<IngredientAmount> }
 */
function bestCombination(pivots, rest, scoreFn, predicate) {

  assert.equal(pivots.length + rest.length, 4);
  assert(rest.length);

  const sum = pivots.reduce((acc, n) => acc + n.quantity, 0);
  const next = rest.shift();
  const restLen = rest.length;
  const solns = [];

  if (!restLen) {
    assert(sum < 100);
    const soln = pivots.concat([{
      quantity: 100 - sum,
      ingredient: next.ingredient
    }]);
    return {
      score: scoreFn(soln),
      ingredients: soln
    };
  }

  for (let i = 1; i <= (100 - sum - restLen); i++) {
    solns.push(bestCombination(pivots.concat([{
      quantity: i,
      ingredient: next.ingredient
    }]), rest.slice(0), scoreFn, predicate));
  }

  assert(solns.length);

  return solns
    .filter(predicate)
    .reduce((best, n) => (!best || n.score > best.score) ? n : best, null);
}

function algo(input, predicate) {
  const ingredients = input.split('\n')
    .filter(util.identity)
    .map(parse);

  const score = set => ATTRIBUTES
    .map(a => set.reduce(
      (acc, n) => acc + n.quantity * n.ingredient[a], 0)
    )
    .reduce((acc, n) => n < 0 ? 0 : acc * n, 1);

  return bestCombination(
    [],
    ingredients.map(i => { return {quantity: null, ingredient: i}; }),
    score,
    predicate || util.identity
  );
}

if (require.main === module) {
  const withCalories = (cal) =>
    soln => soln && soln.ingredients.reduce((acc, n) => acc + n.quantity * n.ingredient.calories, 0) === cal;

  console.log('optimal combination', JSON.stringify(algo(input)));
  console.log('optimal combination with calories=500', JSON.stringify(algo(input, withCalories(500))));

}


module.exports = algo;
