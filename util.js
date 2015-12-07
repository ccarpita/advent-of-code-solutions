
const fs = require('fs');
const path = require('path');

function inputForDay(day) {
  return fs.readFileSync(path.join(__dirname, String(day), 'input'), 'utf-8');
}

exports.inputForDay = inputForDay;
