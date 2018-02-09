var paragraph = require('./paragraph')

module.exports = function (string, center, styles) {
  var argument = {
    alignment: 'left',
    depth: 1,
    title: true,
    content: [{title: string}]
  }
  if (center) {
    argument.alignment = 'center'
  }
  return paragraph(argument, null, null, null, null, styles)
}
