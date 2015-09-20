var paragraph = require('./paragraph')

module.exports = function(string) {
  return "<w:p><w:pPr><w:pStyle w:val=\"Title\"/></w:pPr>" + run({
    depth: 1,
    title: true,
    content: [ { text: string } ] }) + "</w:p>" }
