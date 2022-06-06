var escape = require('../escape')

module.exports = function (array) {
  var scaffolded = require('../data/scaffold.json').word._rels['document.xml.rels']
  if (array.length === 0) return scaffolded
  var appended = []
  for (var index = 0; index < array.length; index++) {
    var assignment = array[index]
    appended.push('<Relationship Id="' + assignment.rId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + escape(assignment.url) + '" TargetMode="External"/>')
  }
  return scaffolded.replace(
    '</Relationships>',
    appended.join('') + '</Relationships>'
  )
}
