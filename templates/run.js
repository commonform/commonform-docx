const assign = require('object-assign')
const escape = require('../escape')
const has = require('has')
const tag = require('./tag')

const defaults = {
  highlight: false,
  bold: false,
  italic: false,
  underline: false
}

module.exports = function run (
  element, numberStyle, conspicuous, blanks, markFilled, styles
) {
  const properties = assign({}, defaults)
  if (conspicuous === true) {
    assign(properties, styles.conspicuous)
  }
  let text = ''
  /* istanbul ignore else */
  if (typeof element === 'string') {
    assign(properties, styles.text)
    text = element
  } else if (has(element, 'caption')) {
    assign(properties, styles.heading)
    text = element.caption
  } else if (has(element, 'title')) {
    assign(properties, styles.title)
    text = element.title
  } else if (has(element, 'monospaced')) {
    assign(properties, styles.monospaced)
    text = element.monospaced
  } else if (has(element, 'definition')) {
    const term = element.definition
    return (
      (
        styles.beforeDefinition
          ? run(
            styles.beforeDefinition, numberStyle, conspicuous, blanks,
            markFilled, styles
          )
          : ''
      ) +
      tag('w:r', runProperties(styles.definition) + runText(term)) +
      (
        styles.afterDefinition
          ? run(
            styles.afterDefinition, numberStyle, conspicuous, blanks,
            markFilled, styles
          )
          : ''
      )
    )
  } else if (has(element, 'blank')) {
    assign(properties, styles.text)
    if (element.blank !== undefined) {
      text = element.blank
      if (markFilled) assign(properties, styles.filled)
    } else {
      text = blanks.text
      if (blanks.highlight) assign(properties, styles.highlighted)
    }
  } else if (has(element, 'use')) {
    assign(properties, styles.use)
    text = element.use
  } else if (has(element, 'heading')) {
    const numbering = element.numbering
    const heading = element.heading
    if (
      has(element, 'broken') ||
      has(element, 'ambiguous')
    ) {
      assign(properties, styles.broken)
      text = '[Broken Cross-Reference to "' + heading + '"]'
    } else {
      text = numberStyle(numbering)
      return (
        // Underlined reference.
        tag(
          'w:r',
          runProperties(assign({}, properties, styles.reference)) +
          runText(text)
        ) +
        // Name of referenced section in parentheses.
        tag(
          'w:r',
          runProperties(assign({}, properties, styles.referenceHeading)) +
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
    return '<w:u w:val="' + underline + '"/>'
  } else {
    return '<w:u w:val="none"/>'
  }
}

function highlightFlag (highlight) {
  return '<w:highlight w:val="' + highlight + '"/>'
}

function flag (name, value) {
  return value ? '<w:' + name + '/>' : ''
}

function runProperties (options) {
  return tag('w:rPr',
    (
      flag('b', options.bold || false) +
      flag('i', options.italic || false) +
      (options.highlight ? highlightFlag(options.highlight) : '') +
      underlineFlag(options.underline || false) +
      (
        options.monospaced
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
  return '<w:t xml:space="preserve">' + escape(text) + '</w:t>'
}
