var escape = require('../escape')
var has = require('has')
var run = require('./run')
var tag = require('./tag')

// Half an inch in twentieths of a point
var HALF_INCH = 720

var alignments = {
  left: 'start',
  right: 'end',
  center: 'center',
  justify: 'both',
  distribute: 'distribute'
}

var properties = function (o, number, indentMargins) {
  // CAVEAT: The order of properties is important.
  var depth = ('heading' in o || 'numbering' in o || 'title' in o)
    ? o.depth
    : o.depth + 1
  var alignment = o.alignment
  return tag('w:pPr',
    '<w:ind' +
    (
      indentMargins
        ? (
          number.length === 0
            ? (' w:left="' + ((depth - 2) * HALF_INCH) + '"')
            : (
              ' w:left="' + ((depth - 1) * HALF_INCH) + '"' +
              ' w:firstLine="-' + HALF_INCH + '"'
            )
        )
        : (' w:firstLine="' + ((depth - 1) * HALF_INCH) + '"')
    ) + ' />' +
    '<w:jc w:val="' + alignments[alignment] + '" />'
  )
}

var TAB = '<w:r><w:tab/></w:r>'

module.exports = function (
  element, numberStyle, indentMargins, blanks, markFilled, styles, rIdForHREF
) {
  if (!has(element, 'alignment')) {
    element.alignment = styles.alignment || 'justify'
  }
  var number = has(element, 'numbering')
    ? numberStyle(element.numbering, true)
    : ''
  var conspicuous = has(element, 'conspicuous')
  var component = has(element, 'component')
  return tag('w:p',
    properties(element, number, indentMargins) +
    (
      number
        ? makeRun(number, false) + TAB
        : ''
    ) + (
      has(element, 'heading')
        ? (
          makeRun({ caption: element.heading }, conspicuous) +
          (/\.$/.test(element.heading) ? '' : makeRun('.', false)) +
          ((component || element.content.length === 0) ? '' : makeRun(' ', false))
        )
        : ''
    ) +
    (
      component
        ? componentToContent(element, rIdForHREF)
        : element.content
          .map(function (element) {
            return makeRun(element, conspicuous)
          })
          .join('')
    )
  )

  function makeRun (element, conspicuous) {
    return run(element, numberStyle, conspicuous, blanks, markFilled, styles)
  }

  function componentToContent (component, rIdForHREF) {
    var href = component.component + '/' + component.version
    var returned = [makeRun('Incorporate ')]
    var rId = rIdForHREF(href)
    returned.push(
      '<w:hyperlink r:id="' + rId + '" w:history="1"><w:r><w:rPr><w:color w:val="0000EE"/><w:u w:val="single"/></w:rPr><w:t>' + escape(href) + '</w:t></w:r></w:hyperlink>'
    )
    var substitutions = component.substitutions
    var hasSubstitutions = (
      Object.keys(substitutions.terms).length > 0 ||
      Object.keys(substitutions.headings).length > 0
    )
    if (hasSubstitutions) {
      returned.push(makeRun(' substituting '))
      var phrases = []
      Object.keys(substitutions.terms).forEach(function (from) {
        var to = substitutions.terms[from]
        phrases.push(makeRun({ use: to }) + makeRun(' for ' + from))
      })
      Object.keys(substitutions.headings).forEach(function (from) {
        var to = substitutions.headings[from]
        phrases.push(makeRun({ heading: to }), makeRun(' for ' + to))
      })
      var length = phrases.length
      if (length === 1) {
        returned.push(phrases[0])
      } else if (length === 2) {
        returned.push(phrases[0])
        returned.push(makeRun(' and '))
        returned.push(phrases[1])
      } else {
        returned.push(
          phrases.slice(0, -1).join(makeRun(', ')) +
          makeRun(', and ') +
          phrases[phrases.length - 1]
        )
      }
    }
    returned.push(makeRun('.'))
    return returned.join('')
  }
}
