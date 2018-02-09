var escape = require('../escape')
var merge = require('merge')
var tag = require('./tag')

var defaults = {
  highlight: false,
  bold: false,
  italic: false,
  underline: false
}

var underlineFlag = function (underline) {
  if (typeof underline === 'string') {
    return '<w:u w:val="' + underline + '"/>'
  } else {
    return '<w:u w:val="none"/>'
  }
}

var highlightFlag = function (highlight) {
  return '<w:highlight w:val="' + highlight + '"/>'
}

var flag = function (name, value) {
  return value ? '<w:' + name + '/>' : ''
}

var runProperties = function (options) {
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

var runText = function (text) {
  return '<w:t xml:space="preserve">' + escape(text) + '</w:t>'
}

module.exports = function run (
  element, numberStyle, conspicuous, blanks, markFilled, styles
) {
  var properties = merge(true, defaults)
  if (conspicuous === true) {
    merge(properties, styles.conspicuous)
  }
  var text = ''
  /* istanbul ignore else */
  if (typeof element === 'string') {
    merge(properties, styles.text)
    text = element
  } else if (element.hasOwnProperty('caption')) {
    merge(properties, styles.heading)
    text = element.caption
  } else if (element.hasOwnProperty('title')) {
    merge(properties, styles.title)
    text = element.title
  } else if (element.hasOwnProperty('monospaced')) {
    merge(properties, styles.monospaced)
    text = element.monospaced
  } else if (element.hasOwnProperty('definition')) {
    var term = element.definition
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
  } else if (element.hasOwnProperty('blank')) {
    if (element.blank !== undefined) {
      text = element.blank
      if (markFilled) {
        merge(properties, styles.filled)
      }
    } else {
      text = blanks.text
      if (blanks.highlight) {
        merge(properties, styles.highlighted)
      }
    }
  } else if (element.hasOwnProperty('use')) {
    merge(properties, styles.use)
    text = element.use
  } else if (element.hasOwnProperty('heading')) {
    var numbering = element.numbering
    var heading = element.heading
    if (
      element.hasOwnProperty('broken') ||
      element.hasOwnProperty('ambiguous')
    ) {
      merge(properties, styles.broken)
      text = '[Broken Cross-Reference to "' + heading + '"]'
    } else {
      text = numberStyle(numbering)
      properties.underline = 'single'
      return (
        // Underlined reference.
        tag(
          'w:r',
          runProperties(merge(true, properties, styles.reference)) +
          runText(text)
        ) +
        // Name of referenced section in parentheses.
        tag(
          'w:r',
          runProperties(merge(true, properties, styles.referenceHeading)) +
          runText('(' + heading + ')')
        )
      )
    }
  } else {
    throw new Error('Invalid type: ' + JSON.stringify(element, null, 2))
  }
  return tag('w:r', runProperties(properties) + runText(text))
}
