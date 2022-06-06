var escape = require('../escape')

module.exports = function (array) {
  var returned = require('../data/scaffold.json').word._rels['document.xml.rels']
  var appended = []
  for (var index = 0; index < array.length; index++) {
    var assignment = array[index]
    appended.push('<Relationship Id="' + assignment.rId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + escape(assignment.url) + '"/>')
  }
  return returned.replace(
    '</Relationships>',
    appended.join('') + '</Relationships>'
  )
}
