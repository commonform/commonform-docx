var JSZip = require('jszip')
var commonformHash = require('commonform-hash')
var merge = require('merge')

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

var defaultStyles = {
  use: {},
  text: {},
  conspicuous: {bold: true, italic: true},
  heading: {underling: 'single'},
  title: {bold: true},
  beforeDefinition: '"',
  definition: {bold: true},
  afterDefinition: '"',
  filled: {underline: 'dash'},
  monospaced: {monospaced: true},
  highlighted: {highlight: true},
  broken: {highlight: 'red'},
  reference: {underline: 'single'},
  referenceHeading: {}
}

module.exports = function (form, values, options) {
  var title = options.title
  var edition = options.edition
  var hash = options.hash ? commonformHash(form) : undefined
  var centerTitle = options.centerTitle || false
  var numberStyle = options.numbering
  var indentMargins = options.indentMargins || false
  var after = options.after || ''
  var styles = options.styles
    ? merge(true, options.styles, defaultStyles)
    : defaultStyles
  var blanks = options.blanks === undefined
    ? {text: '[•]', highlight: 'yellow'}
    : typeof options.blanks === 'string'
      ? {text: options.blanks}
      : options.blanks
  var markFilled = !!options.markFilled
  var scaffold = require('./data/scaffold.json')
  scaffold.word['document.xml'] = doc(
    form, values, title, edition, hash,
    centerTitle, numberStyle, indentMargins, after, blanks, markFilled,
    styles
  )
  var zip = new JSZip()
  zipObject(zip, scaffold)
  return zip
}
