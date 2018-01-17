var JSZip = require('jszip')
var commonformHash = require('commonform-hash')

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
  var edition = options.edition
  var hash = options.hash ? commonformHash(form) : undefined
  var centerTitle = options.centerTitle || false
  var numberStyle = options.numbering
  var indentMargins = options.indentMargins || false
  var after = options.after || ''
  var blanks = options.blanks === undefined
    ? {text: '[•]', highlight: 'yellow'}
    : typeof options.blanks === 'string'
      ? {text: options.blanks}
      : options.blanks
  var markFilled = !!options.markFilled
  var nearestHeadings = !!options.nearestHeadings
  var scaffold = require('./data/scaffold.json')
  scaffold.word['document.xml'] = doc(
    form,
    values,
    title,
    edition,
    hash,
    centerTitle,
    numberStyle,
    indentMargins,
    after,
    blanks,
    markFilled,
    nearestHeadings
  )
  var zip = new JSZip()
  zipObject(zip, scaffold)
  return zip
}
