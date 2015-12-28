'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

exports.seq = require('./seq');

function inputForDay(day) {
  return fs.readFileSync(path.join(__dirname, String(day), 'input'), 'utf-8');
}
exports.inputForDay = inputForDay;

function md5hex(str) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}
exports.md5hex = md5hex;

function parser(regex, fields, transform) {
  assert(typeof regex.test === 'function');
  assert(fields.length);
  assert(!transform || typeof transform === 'function');
  return function(line) {
    const match = line.match(regex);
    if (!match) {
      throw new Error("parse error: " + line);
    }
    const item = {};
    for (let i = 0; i < fields.length; i++) {
      const nameFormat = fields[i].split(':');
      let val = match[i + 1];
      if (nameFormat[1] === 'number') {
        val = Number(val);
      }
      item[nameFormat[0]] = val;
    }
    return transform ? transform(item) : item;
  }
}
exports.parser = parser;

exports.identity = (id) => id;

function traceFn(fn, name) {
  return function() {
    const res = fn.apply(null, arguments);
    console.log(name || '(debug)', arguments, '=>', res);
    return res;
  }
}
exports.traceFn = traceFn;

function curry(fn, args) {
  const slice = args.slice;
  const curried = slice.call(args);
  return function() {
    return fn.apply(null, curried.concat(slice.call(arguments)));
  }
}
exports.curry = curry;

/**
 * Given an array of 2-element arrays, collect the results into a plain
 * object where the first item of each pair is a key.  Elements in the
 * list will override any earlier encountered elements with the same key,
 * unless a manual reducer is specified.
 *
 * @param {Array<Array<*>.length==2>}
 *   Example: [['key1', 'value1'], ['key2', 'value2']]
 * @param {Function} [reduceFn] Default: (current, next) => next
 */
function collectMap(arr, reduceFn) {
  const reduceValue = reduceFn ? reduceFn : (current, next) => next;
  return arr.reduce((acc, n) => {
    acc[n[0]] = reduceValue(acc[n[0]], n[1]);
    return acc;
  }, {});
}
exports.collectMap = collectMap;

exports.collectMultiMap = arr => collectMap(
  arr,
  (vs, next) => vs ? (vs.push(next) && vs) : [next]
);

function keyValues(obj) {
  return Object.keys(obj)
    .map(k => [k, obj[k]]);
}
exports.keyValues = keyValues;


function range(from, to) {
  const r = [];
  for (let i = from; i <= to; i++) {
    r.push(i);
  }
  return r;
}
exports.range = range;

function isArray(o) {
  return typeof o === 'object'
    && typeof o.length === 'number'
    && !o.propertyIsEnumerable('length');
};

function flatten(arr) {
  const f = [];
  arr.forEach(i => {
    if (isArray(i)) {
      i.forEach(ii => f.push(ii));
    } else {
      f.push(i);
    }
  });
  return f;
}
exports.flatten = flatten;

function flatMap(arr, mapFn) {
  let flattened = [];
  arr.forEach(i => {
    const mapped = mapFn(i);
    if (isArray(mapped)) {
      mapped.forEach(item => flattened.push(item));
    } else {
      flattened.push(mapped);
    }
  });
  return flattened;
}
exports.flatMap = flatMap;

function memoize(fn) {
  const slice = [].slice;
  const curried = new Map();
  const results = new Map();
  return function() {
    const rest = slice.call(arguments);
    const first = rest.shift();
    if (rest.length) {
      if (!curried.has(first)) {
        curried.set(arg, memoize(curry(fn, [first])));
      }
      return curried.get(arg).apply(null, rest);
    }
    if (!results.has(first)) {
      results.set(first, fn(first));
    }
    return results.get(first);
  }
}
exports.memoize = memoize;


/**
 * This function uses a generators, predicate, and comparison function to
 * recursively generate a sparse decision tree.  Nodes passing the completion
 * predicate are eligible for selection as the optimum.
 *
 * Nodes in the tree will contain references to their parents, but not vice versa,
 * so GC can cleanup processed decision paths.  Thus the maximum live memory used
 * by the tree will equal sizeof(Node) * depth.
 *
 * A Node has the following shape:
 * {
 *   value: any,
 *   parent: maybe(instanceOf(Node)),
 *   depth: Number,
 *   root: instanceOf(Node),
 *
 *   // Set on root nodes, and resolved when tree generation is complete.
 *   optimum: maybe(Node)
 * }
 *
 * @param {Function<Node, Array<Value>} nextFn A function which takes a node
 *   and returns an array of values to be used to generate the child nodes.
 *
 * @param {Function<Node, Boolean>} completionPredicate A function which takes
 *   a node and returns true if the node is "complete", which means that it can
 *   be used as an optimum, and no child nodes will be processed.
 * @param {BiFunction<Node, Node, Number>} compareFn A function which compares
 *   two nodes.  If the returned value is greater than zero, the first passed
 *   node is considered to be more optimal than the second node.
 * @param {*} value The initial root node value of the tree.
 *
 * @private @param {Node} [_parent] Used recursively. If set, the node returned is
 *   an intermediate node and not the root node.
 */
function generateDecisionTree(nextFn, completionPredicate, compareFn, value, _parent) {

  const parent = _parent;
  const depth = parent ? parent.depth + 1 : 0;
  const node = {
    value,
    depth,
    parent
  };
  const root = parent ? parent.root : node;
  node.root = root;

  if (completionPredicate(node)) {
    if (!root.optimum || compareFn(node, root.optimum) > 0) {
      root.optimum = node;
    }
  } else {
    nextFn(node)
      .forEach(value => generateDecisionTree(
        nextFn,
        completionPredicate,
        compareFn,
        value,
        node
      ));
  }
  return node;
}
exports.generateDecisionTree = generateDecisionTree;

function benchReport(ms, mesg) {
  let last;
  let i = 0;
  return function() {
    i++;
    const current = Date.now();
    if (!last || (current - last) >= ms) {
      const args = Array.prototype.slice.call(arguments);
      if (last) {
        console.log('bench[' + mesg + ']: ' + (current - last) + 'ms, ' + i + ' iterations, ' + args.toString());
      }
      last = current;
    }
  }
}
exports.benchReport = benchReport;
