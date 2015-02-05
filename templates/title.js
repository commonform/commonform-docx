var paragraph = require('./paragraph');

module.exports = function(string) {
  return paragraph({
    alignment: 'center',
    depth: 0,
    flattened: [{bold: true, text: string}]
  });
};
