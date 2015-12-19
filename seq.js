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
  // is pulled, we should resume from this point.
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
    closed: false
  }, typeof opt === 'function' ? {
    generator: opt
  } : opt);

  const buffer = [];

  let closed = options.closed;

  /**
   * If given an argument, pull a specific value from that index. If the given
   * argument is greater than the buffer size, the argument will be ignored and
   * the next value generated.  If no argument is passed, the next value is
   * generated, cached for future calls, and returned.
   */
  this.pull = i => {
    const pos = i || buffer.length;
    if (pos < buffer.length) {
      return buffer[pos];
    }
    if (closed) {
      return null;
    }
    const result = options.generator(pos, this);

    if (check(result)) {
      buffer[pos] = result;
    }
    if (!check(result)
        || (options.closeWhen && options.closeWhen(i + 1))) {
      closed = true;
    }
    return result;
  };

  this.close = () => closed = true;

  this.isClosed = () => closed;

  this.filter = predicate => createFilter(this, predicate);

  // Map usage results in OOM errors, need to debug:
  // this.map = transform => new Sequence(i => transform(this.pull(i)));

  this.first = () => this.pull(0);

  this.toArray = () => {
    this.resolve();
    return buffer.slice(0);
  };

  this.reduce = (fn, init) => this.toArray().reduce(fn, init);

  // Fill the buffer up to the max safe integer limit, returning
  // null if the limit was reached, or the total buffer length;
  this.resolve = () => {
    let len = buffer.length;
    for (; check(this.pull(len)); len++) {
      if (len === Math.MAX_SAFE_INTEGER) {
        this.close();
        return null;
      }
    }
    return len;
  };

  this.length = () => {
    if (closed) {
      return buffer.length;
    }
    return this.resolve();
  };

  this.last = () => {
    if (!closed) {
      this.resolve();
    }
    return buffer[this.length() - 1];
  };
};

function seq(generator, closeWhen) {
  if (typeof generator === 'number') {
    const init = generator;
    generator = (i) => i + init;
  }
  if (typeof closeWhen === 'number') {
    const last = closeWhen;
    closeWhen = (i) => i > last;
  }
  return new Sequence({generator, closeWhen});
}

module.exports = seq;
