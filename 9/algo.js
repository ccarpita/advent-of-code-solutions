#!/usr/bin/env node

'use strict';

const util = require('../util');
const assert = require('assert');

const input = util.inputForDay(9);

function isWordChars(word) {
  return word.match(/^\w+$/);
}

function isNumberChars(word) {
  return word.match(/^\d+$/);
}

function parse(line) {
  const words = line.split(' ')
    .filter(w => w === '=' || isWordChars(w));
  if (words[1] !== 'to') {
    throw new Error("Expected 'to' as 2nd token: " + line);
  }
  if (words[3] !== '=') {
    throw new Error("Expected '=' as 4th token: " + line);
  }
  if (!isNumberChars(words[4])) {
    throw new Error("Expected number as 5th token: " + line);
  }
  return {
    from: words[0],
    to: words[2],
    cost: Number(words[4])
  };
}

/**
 * Given an array, return an array of arrays, representing
 * all possible orderings of the items.
 */
function allOrders(arr) {
  const l = arr.length;
  if (l === 0) {
    return [];
  }
  if (l === 1) {
    return [[arr[0]]];
  }
  const c = [];
  for (let i = 0; i < l; i++) {
    const rest = arr.slice(0);
    rest.splice(i, 1);
    allOrders(rest)
      .forEach(order => c.push([arr[i]].concat(order)));
  }
  return c;
}

function deepSet(map, keys, value) {
  let current = map;
  for (let i = 0, l = keys.length; i < l; i++) {
    const k = keys[i];
    if (i < (l - 1)) {
      map[k] = map[k] || {};
      current = map[k];
    } else {
      current[k] = value;
    }
  }
}

function deepSetAll(map, keys, value) {
  allOrders(keys)
    .forEach(ord => deepSet(map, ord, value))
}

/**
 * Given input file, generate Map<String, Map<String, Number>>
 * where the keys are all destinations, and the values are
 * maps of all other destinations to the associated cost.
 */
function costMapFromInput(input) {
  const costMap = {};
  input.split("\n")
    .filter(l => l)
    .map(parse)
    .forEach(item => {
      deepSetAll(costMap, [item.from, item.to], item.cost)
    });
  return costMap;
}

/**
 * Return an array of the given node and all of its ancestors,
 * up to the root node.
 */
function ancestry(node) {
  if (!node) {
    return [];
  }
  const a = [node];
  let current = node.parent;
  while (current) {
    a.push(current);
    current = current.parent;
  }
  return a;
}

/**
 * Return true if the passed node is a valid leaf, meaning that its
 * ancestry in the decision tree (including itself) has reached every
 * node of the given cost map.
 */
function isValidSolution(costMap, node) {
  const reachedLocation = {};
  ancestry(node).forEach(n => reachedLocation[n.location] = true);
  return Object.keys(costMap)
    .filter(l => !(l in reachedLocation))
    .length === 0;
}

/**
 * Given a starting location and intra-loc cost map, generate a decision tree
 * in which each node will be visited exactly once.  Each node in the tree
 * has the following shape:
 * {
 *   parent: Node,
 *   root: Node,
 *   accumulatedCost: Number,
 *   location: String,
 *   moves: Array<Node>
 *
 *   // Additionally, the root node will have the following properties:
 *   optimum: Node
 * }
 *
 * Child nodes will be added for locations which can be reached by the current
 * location, and which are not found in the current or ancestor nodes.
 *
 * Luckily for the problem complexity, we are not permitted to visit a location
 * multiple times.  Allowing multiple visits would require an additional cyclical
 * duplication check, to ensure we don't run in circles!
 *
 * @param {CostMap} costMap Mapping of location -> location -> cost
 * @param {String} location ID of location
 * @param {Node} [parent] Parent node. Undefined when called for the first time
 * @param {Node} [root] Root node. Undefined when called for the first time
 * @param {String} optimize If "max", update root
 *    the given node is an improvement on the current optimum
 */
function generateDecisionTree(costMap, loc, parent, root, optimize) {
  if (!costMap[loc]) {
    return
  }

  const node = {
    location: loc,
    parent: parent,
    root: root,
    accumulatedCost: parent ? (parent.accumulatedCost + costMap[loc][parent.location]) : 0,
    moves: []
  };

  const skipNode = () => {
    // If we're optimizing on minimum distance, we can short circuit
    // tree generation if the accumulated distance is already longer
    // than the optimum.  Unfortunately we can't optimize this way
    // for max-distance calculation, as there is always a chance that
    // the next move distance could lead to a global optimum.
    return root
      && root.optimum
      && optimize !== 'max'
      && node.accumulatedCost > root.optimum.accumulatedCost;
  };

  const isOptimum = () => {
    if (!root.optimum) {
      return true;
    }
    if (optimize === 'max') {
      return node.accumulatedCost > root.optimum.accumulatedCost;
    } else {
      return node.accumulatedCost < root.optimum.accumulatedCost;
    }
  }

  if (!skipNode()) {
    if (isValidSolution(costMap, node)) {
      if (isOptimum()) {
        root.optimum = node;
      }
    } else {
      const hasVisited = (toLoc) =>
        ancestry(parent)
          .map(n => n.location)
          .filter(l => l === loc)
          .length > 0;

      const generateSubtree = (toLoc) =>
        generateDecisionTree(costMap, toLoc, node, root || node, optimize);
      const addMove = (toLoc) => node.moves.push(generateSubtree(toLoc));

      const canMove = (toLoc) => toLoc !== loc && !hasVisited(toLoc);

      Object.keys(costMap[loc])
        .filter(canMove)
        .forEach(addMove);
    }
  }

  if (!node.root) {
    console.log('Optimal path found', nodeToString(node.optimum));
  }

  return node;
}

function nodeToString(node) {
  const parents = ancestry(node);
  parents.shift();
  return '<Node accumulatedCost={' + node.accumulatedCost + '} '
    + 'location={' + node.location + '} '
    + 'ancestry={' + parents.map(n => n.location).join(',') + '} '
    + '/>';
}

function minimumReducer(acc, dist) {
  if (typeof acc === 'undefined') {
    return dist;
  }
  return dist < acc ? dist : acc;
}

function maximumReducer(acc, dist) {
  if (typeof acc === 'undefined') {
    return dist;
  }
  return dist > acc ? dist : acc;
}

function algo(input, optimize) {
  const costMap = costMapFromInput(input);

  return Object.keys(costMap)
    .map(loc => generateDecisionTree(costMap, loc, null, null, optimize))
    .filter(root => root.optimum)
    .map(root => root.optimum.accumulatedCost)
    .reduce(optimize === 'max' ? maximumReducer : minimumReducer)
}

if (require.main === module) {
  console.log('Minimum Distance', algo(input));
  console.log('Maximum Distance', algo(input, 'max'));
}
module.exports = algo;
