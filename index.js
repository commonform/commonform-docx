var JSZip = require('jszip')

var doc = require('./templates/document')

var zipObject = function (zip, object) {
  Object.keys(object).forEach(function (path) {
    var content = object[path]
    // File
    if (typeof content === 'string') {
      zip.file(path, content.trim())
    // Folder
    } else {
      zipObject(zip.folder(path), content)
    }
  })
}

module.exports = function (form, values, options) {
  var title = options.title
  var centerTitle = options.centerTitle || false
  var numberStyle = options.numbering
  var indentMargins = options.indentMargins || false
  var after = options.after || ''
  var blanks = options.blanks === undefined
    ? {text: '[•]', highlight: 'yellow'}
    : typeof options.blanks === 'string'
      ? {text: options.blanks}
      : options.blanks
  var scaffold = require('./data/scaffold.json')
  scaffold.word['document.xml'] = doc(
    form, values, title,
    centerTitle, numberStyle, indentMargins, after, blanks
  )
  var zip = new JSZip()
  zipObject(zip, scaffold)
  return zip
}
