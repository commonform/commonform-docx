const escape = require('../escape')
const has = require('has')
const tag = require('./tag')

const defaults = {
  highlight: false,
  bold: false,
  italic: false,
  underline: false
}

module.exports = function run (element, conspicuous, options) {
  const { styles } = options
  const properties = Object.assign({}, defaults)
  if (conspicuous === true) {
    Object.assign(properties, styles.conspicuous)
  }
  let text = ''
  /* istanbul ignore else */
  if (typeof element === 'string') {
    Object.assign(properties, styles.text)
    text = element
  } else if (has(element, 'caption')) {
    Object.assign(properties, styles.heading)
    text = element.caption
  } else if (has(element, 'title')) {
    Object.assign(properties, styles.title)
    text = element.title
  } else if (has(element, 'monospaced')) {
    Object.assign(properties, styles.monospaced)
    text = element.monospaced
  } else if (has(element, 'definition')) {
    const term = element.definition
    return (
      (
        styles.beforeDefinition
          ? run(styles.beforeDefinition, conspicuous, options)
          : ''
      ) +
      tag('w:r', runProperties(styles.definition) + runText(term)) +
      (
        styles.afterDefinition
          ? run(styles.afterDefinition, conspicuous, options)
          : ''
      )
    )
  } else if (has(element, 'blank')) {
    Object.assign(properties, styles.text)
    if (element.blank !== undefined) {
      text = element.blank
      if (options.markFilled) Object.assign(properties, styles.filled)
    } else {
      if (options.complete) throw new Error('no value for blank')
      text = options.blanks.text
      if (options.blanks.highlight) Object.assign(properties, styles.highlighted)
    }
  } else if (has(element, 'use')) {
    Object.assign(properties, styles.use)
    text = element.use
  } else if (has(element, 'heading')) {
    const numbering = element.numbering
    const heading = element.heading
    if (
      has(element, 'broken') ||
      has(element, 'ambiguous')
    ) {
      Object.assign(properties, styles.broken)
      text = '[Broken Cross-Reference to "' + heading + '"]'
    } else {
      text = options.numberStyle(numbering)
      return (
        // Underlined reference.
        tag(
          'w:r',
          runProperties(Object.assign({}, properties, styles.reference)) +
          runText(text)
        ) +
        // Name of referenced section in parentheses.
        tag(
          'w:r',
          runProperties(Object.assign({}, properties, styles.referenceHeading)) +
          runText(' (' + heading + ')')
        )
      )
    }
  } else {
    throw new Error('Invalid type: ' + JSON.stringify(element, null, 2))
  }
  return tag('w:r', runProperties(properties) + runText(text))
}

function underlineFlag (underline) {
  if (typeof underline === 'string') {
    return `<w:u w:val="${underline}"/>`
  } else {
    return '<w:u w:val="none"/>'
  }
}

function highlightFlag (highlight) {
  return `<w:highlight w:val="${highlight}"/>`
}

function flag (name, value) {
  return value ? `<w:${name}/>` : ''
}

function runProperties (style) {
  return tag('w:rPr',
    (
      flag('b', style.bold || false) +
      flag('i', style.italic || false) +
      (style.highlight ? highlightFlag(style.highlight) : '') +
      underlineFlag(style.underline || false) +
      (
        style.monospaced
          ? (
              '<w:rFonts ' +
              'w:ascii="Courier New" ' +
              'w:hAnsi="Courier New" ' +
              'w:cs="Courier New"/>' +
              '<w:sz w:val="20"/>'
            )
          : ''
      )
    )
  )
}

function runText (text) {
  return `<w:t xml:space="preserve">${escape(text)}</w:t>`
}
