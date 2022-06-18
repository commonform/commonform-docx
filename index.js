const JSZip = require('jszip')
const commonformHash = require('commonform-hash')
const decimalNumbering = require('decimal-numbering')
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

module.exports = (
  form,
  values = [],
  {
    a4 = false,
    after = '',
    blanks = { text: '[•]', highlight: 'yellow' },
    hash = false,
    incorporateComponentText = 'Incorporate',
    indentMargins = false,
    leftAlignBody = false,
    leftAlignTitle = false,
    loadedComponentStyle = 'inline',
    markFilled = false,
    numberStyle = decimalNumbering,
    quoteComponentText = 'Quoting for convenience, with any conflicts resolved in favor of the standard:',
    smart,
    styles,
    title,
    version
  }
) => {
  styles = styles
    ? Object.assign({}, defaultStyles(smart), styles)
    : defaultStyles(smart)
  if (typeof blanks === 'string') blanks = { text: blanks }
  hash = hash ? commonformHash(form) : undefined
  const result = doc(
    smart ? smartify(form) : form,
    values,
    {
      a4,
      after,
      blanks,
      hash,
      incorporateComponentText,
      indentMargins,
      leftAlignBody,
      leftAlignTitle,
      loadedComponentStyle,
      markFilled,
      numberStyle,
      quoteComponentText,
      smart,
      styles,
      title,
      version
    }
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
  Object.keys(object).forEach(path => {
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
