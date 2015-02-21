var Immutable = require('immutable');
var paragraph = require('./paragraph');

module.exports = function(string) {
  return paragraph(Immutable.fromJS({
    alignment: 'center',
    depth: 0,
    content: [{bold: true, text: string}]
  }));
};
