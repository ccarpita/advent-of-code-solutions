'use strict';

/**
 * A library for generating monadic lazy-evaluated sequences.
 */

/**
 * Return true if the value is null or undefined
 */
function check(val) {
  return val !== null && typeof val !== 'undefined';
}

/**
 * Generate an array with a range of values
 * @param {Integer} from Starting point of the range, inclusive
 * @param {Integer} to Endpoint point of the range, non-inclusive
 *
 * @example
 *    range(1, 5)
 *    => [1, 2, 3, 4]
 */
function range(from, to) {
  assert(from < to);
  const range = [];
  let i = from;
  for (let i = from; i < to; i++) {
    range.push(i);
  }
  return range;
}

function createFilter(from, predicate) {
  const filterBuffer = [];

  // Keep track of how many sequence items we have retrieved
  // from the parent sequence.  When the filtered sequence
  // is pulled, we have to resume from this point.
  let fromIter = 0;

  return new Sequence((i, sequence) => {
    if (check(filterBuffer[i])) {
      return filterBuffer[i];
    }
    for (let j = filterBuffer.length; j <= i; j++) {
      if (sequence.isClosed()) {
        break;
      }
      let res = null;
      while (!check(res)) {
        res = from.pull(fromIter++);
        if (!check(res) || from.isClosed()) {
          sequence.close();
          break;
        }
        if (predicate(res)) {
          filterBuffer[j] = res;
          break;
        } else {
          res = null;
        }
      }
      if (!check(res)) {
        sequence.close();
      }
    }
    return filterBuffer[i];
  });
};

/**
 * Create a new sequence.  The passed options are considered to be immutable,
 * and so may be used to initialize other sequences.
 */
function Sequence(opt) {
  const options = Object.assign({
    start: 0,
    closed: false
  }, typeof opt === 'function' ? {
    generator: opt
  } : opt);

  const buffer = [];

  let closed = options.closed;
  let current = options.start;

  /**
   * If given an argument, pull a specific value from that index. If the given
   * argument is greater than the buffer size, the argument will be ignored and
   * the next value generated.  If no argument is passed, the next value is
   * generated, cached for future calls, and returned.
   */
  this.pull = i => {
    if (check(i) && i < buffer.length) {
      return buffer[i];
    }
    if (closed) {
      return null;
    }
    const result = buffer[current] = options.generator(current, this);
    if (!check(result)
        || (options.closeWhen && options.closeWhen(current + 1))) {
      closed = true;
    }
    current++;
    return result;
  };

  this.close = () => closed = true;

  this.isClosed = () => closed;

  this.filter = predicate => createFilter(this, predicate);

  this.map = transform => new Sequence(i => transform(this.pull(i)));

  this.first = () => this.pull(0);

  this.toArray = n => range(0, n).map(i => this.pull(i));

  this.reduce = (fn, init, n) => this.toArray(n).reduce(fn, init);

};

function seq(gen) {
  let init = 0;
  if (typeof gen === 'number') {
    init = gen;
    gen = function(i) {
      return i + init;
    }
  }
  return new Sequence(gen);
}

module.exports = seq;
