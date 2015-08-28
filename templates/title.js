var paragraph = require('./paragraph')

module.exports = function(string) {
  return paragraph({
    alignment: 'center',
    depth: 1,
    content: [ { bold: true, text: string } ] }) }
