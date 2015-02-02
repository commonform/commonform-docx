var paragraph = require('./paragraph');

module.exports = function(string) {
  return paragraph({
    alignment: 'center',
    content: [{bold: true, text: string}]
  });
};
