
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

exports.seq = require('./seq');
