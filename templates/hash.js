var paragraph = require('./paragraph')

module.exports = function (string, center, styles) {
  return paragraph({
    alignment: center ? 'center' : 'left',
    depth: 1,
    title: true,
    content: [{ monospaced: string }]
  }, null, null, null, null, styles)
}
