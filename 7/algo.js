#!/usr/bin/env node

const util = require('../util');
const input = util.inputForDay(7);
const assert = require('assert');

const operations = {
  NOT: a => 0xFFFF & ~a,
  RSHIFT: (a, b) => 0xFFFF & (a >> b),
  LSHIFT: (a, b) => 0xFFFF & (a << b),
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  XOR: (a, b) => a ^ b
};

const wireRegex = /^[a-z][a-z]?$/;

function parseToken(tok) {

  const num = parseInt(tok, 10);
  if (!isNaN(num)) {
    return {
      type: 'number',
      value: num
    };
  }
  if (!tok) {
    return null;
  }
  if (tok in operations) {
    return {
      type: 'op',
      value: operations[tok]
    };
  }
  if (wireRegex.test(tok)) {
    return {
      type: 'wire',
      value: tok
    }
  }
  throw new Error('invalid token: ' + tok);
}

function contains(arr, i) {
  return arr.filter(e => e === i).length > 0;
}

function tokensOfType(tokens, types) {
  return tokens
    .filter(t => contains(types, t.type))
    .map(t => t.value);
}

/**
 * Parse line instruction into shape of:
 * {
 *   op: func,
 *   inputs: arrayOf(InputToken),
 *   output: String
 * }
 *
 * Where InputToken is a String if referencing a wire value, or
 * a Number if its a raw integer value.  The output field is
 * always a wire value (String).
 */
function parseInstruction(line) {
  const inst = {resolved: false};
  const io = line.split(' -> ');
  const input = io[0];
  const tokens = input.split(' ')
    .map(parseToken)
    .filter(v => v);

  const ops = tokensOfType(tokens, ['op']);
  const inputs = tokensOfType(tokens, ['wire', 'number']);

  try {
    if (ops.length > 1) {
      throw new Error('input error: too many operations: ' + line);
    }
    if (!ops.length && inputs.length !== 1) {
      throw new Error('assignment op requires a single argument: ' + line);
    }
    if (inputs.length > 2) {
      throw new Error('input error: too many inputs: ' + line);
    }

    inst.op = ops[0];
    inst.inputs = inputs;
    inst.output = io[1];
    inst.src = line;
  } catch (e) {
    console.error('parse error', line, 'tokens=', tokens, 'ops=', ops, 'inputs=', inputs);
    throw e;
  }
  return inst;
}

function readInput(wireSignal, i) {
  if (typeof i === 'number') {
    return i;
  }
  if (i in wireSignal) {
    return wireSignal[i];
  }
  throw new Error('attempted to read undefined input: ' + i);
}

function executeInstruction(wireSignal, inst, debug) {
  const current = wireSignal[inst.output];
  if (!inst.op) {
    wireSignal[inst.output] = readInput(wireSignal, inst.inputs[0]);
  } else {
    wireSignal[inst.output] = inst.op.apply(
      null,
      inst.inputs.map(i => readInput(wireSignal, i))
    );
  }
  if (debug) {
    console.info('execute:inst', inst);
    console.info('execute:before->after', current, '->', wireSignal[inst.output]);
  }
  inst.resolved = true;
}

function canResolveInstruction(wireSignal, inst) {
  return inst.inputs
    .filter(i => typeof i === 'string')
    .filter(i => !(i in wireSignal))
    .length === 0;
}

function algo(input, opt) {
  const options = Object.assign(
    {debug: false},
    opt || {}
  );
  const instructionSet = input.split("\n")
    .filter(l => l)
    .map(parseInstruction)

  const wireSignal = {};

  const canResolve = inst => canResolveInstruction(wireSignal, inst);
  const unresolved = inst => !inst.resolved;
  const execute = inst => executeInstruction(wireSignal, inst, options.debug);
  const hasUnresolved = () => instructionSet.filter(unresolved).length > 0;

  while (hasUnresolved()) {
    instructionSet
      .filter(unresolved)
      .filter(canResolve)
      .forEach(execute);
  }

  return wireSignal;
}

function test() {
  const res = algo([
    '123 -> x',
    '456 -> y',
    'x AND y -> d',
    'x OR y -> e',
    'x LSHIFT 2 -> f',
    'y RSHIFT 2 -> g',
    'NOT x -> h',
    'NOT y -> i',
  ].join('\n'), {debug: false});

  assert.equal(res.d, 72);
  assert.equal(res.e, 507);
  assert.equal(res.f, 492);
  assert.equal(res.g, 114);
  assert.equal(res.h, 65412);
  assert.equal(res.i, 65079);
  assert.equal(res.x, 123);
  assert.equal(res.y, 456);
}

if (require.main === module) {
  test();
  const states = [];
  states[0] = algo(input);
  console.log('wire a:', states[0].a);

  states[1] = algo([
    input,
    states[0].a + " -> b"
  ].join("\n"));
  console.log('iteration 2, wire a:', states[1].a);
}

module.exports = algo;
