var paragraph = require('./paragraph')

module.exports = function(string) {
  return paragraph({
    alignment: 'center',
    depth: 1,
    title: true,
    content: [ { title: string } ] }) }
