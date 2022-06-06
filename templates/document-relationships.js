module.exports = function (array) {
  var returned = require('../data/scaffold.json').word._rels['document.xml.rels']
  var offset = 100 // Skip to avoid conflicts with existing rIds.
  var appended = []
  for (var index = 0; index < array.length; index++) {
    var href = array[index]
    appended.push('<Relationship Id="rId' + (offset + index) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + href + '"/>')
  }
  return returned.replace(
    '</Relationships>',
    appended.join('') + '</Relationships>'
  )
}
