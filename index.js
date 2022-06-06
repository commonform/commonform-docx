var JSZip = require('jszip')
var assign = require('object-assign')
var commonformHash = require('commonform-hash')
var smartify = require('commonform-smartify')

var doc = require('./templates/document')
var docRels = require('./templates/document-relationships')

function defaultStyles (smart) {
  return {
    use: {},
    text: {},
    conspicuous: { bold: true, italic: true },
    heading: { underline: 'single' },
    title: { bold: true },
    beforeDefinition: smart ? '“' : '"',
    definition: { bold: true },
    afterDefinition: smart ? '”' : '"',
    filled: { underline: 'dash' },
    monospaced: { monospaced: true },
    highlighted: { highlight: 'yellow' },
    broken: { highlight: 'red' },
    reference: { underline: 'single' },
    referenceHeading: {}
  }
}

module.exports = function (form, values, options) {
  var title = options.title
  var version = options.version
  var hash = options.hash ? commonformHash(form) : undefined
  var centerTitle = options.centerTitle || false
  var leftAlignBody = options.leftAlignBody || false
  var numberStyle = options.numbering
  var indentMargins = options.indentMargins || false
  var a4Paper = options.a4 || false
  var after = options.after || ''
  var smart = options.smartify
  var styles = options.styles
    ? assign({}, defaultStyles(smart), options.styles)
    : defaultStyles(smart)
  var blanks = options.blanks === undefined
    ? { text: '[•]', highlight: 'yellow' }
    : typeof options.blanks === 'string'
      ? { text: options.blanks }
      : options.blanks
  var markFilled = !!options.markFilled
  var result = doc(
    smart ? smartify(form) : form,
    values, title, version, hash,
    centerTitle, leftAlignBody, numberStyle, indentMargins, a4Paper, after, blanks, markFilled,
    styles,
    smart
  )
  var scaffold = require('./data/scaffold.json')
  var clone = Object.assign({}, scaffold)
  clone.word['document.xml'] = result.xml
  clone.word._rels['document.xml.rels'] = docRels(result.hrefs)
  var zip = new JSZip()
  zipObject(zip, clone)
  return zip
}

function zipObject (zip, object) {
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
