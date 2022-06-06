const JSZip = require('jszip')
const commonformHash = require('commonform-hash')
const smartify = require('commonform-smartify')

const doc = require('./templates/document')
const docRels = require('./templates/document-relationships')

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
  const title = options.title
  const version = options.version
  const hash = options.hash ? commonformHash(form) : undefined
  const centerTitle = options.centerTitle || false
  const leftAlignBody = options.leftAlignBody || false
  const numberStyle = options.numbering
  const indentMargins = options.indentMargins || false
  const a4Paper = options.a4 || false
  const after = options.after || ''
  const smart = options.smartify
  const styles = options.styles
    ? Object.assign({}, defaultStyles(smart), options.styles)
    : defaultStyles(smart)
  const blanks = options.blanks === undefined
    ? { text: '[•]', highlight: 'yellow' }
    : typeof options.blanks === 'string'
      ? { text: options.blanks }
      : options.blanks
  const markFilled = !!options.markFilled
  const result = doc(
    smart ? smartify(form) : form,
    values, title, version, hash,
    centerTitle, leftAlignBody, numberStyle, indentMargins, a4Paper, after, blanks, markFilled,
    styles,
    smart
  )
  const scaffold = require('./data/scaffold.json')
  const clone = Object.assign({}, scaffold)
  clone.word['document.xml'] = result.xml
  clone.word._rels['document.xml.rels'] = docRels(result.hrefs)
  const zip = new JSZip()
  zipObject(zip, clone)
  return zip
}

function zipObject (zip, object) {
  Object.keys(object).forEach(function (path) {
    const content = object[path]
    // File
    if (typeof content === 'string') {
      zip.file(path, content.trim())
    // Folder
    } else {
      zipObject(zip.folder(path), content)
    }
  })
}
