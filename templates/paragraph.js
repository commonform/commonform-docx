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
  element, numberStyle, indentMargins, blanks, markFilled, styles
) {
  if (!has(element, 'alignment')) {
    element.alignment = styles.alignment || 'justify'
  }
  var number = has(element, 'numbering')
    ? numberStyle(element.numbering, true)
    : ''
  var conspicuous = has(element, 'conspicuous')
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
          (
            /\.$/.test(element.heading)
              ? makeRun(' ', false)
              : makeRun('. ', false)
          )
        )
        : ''
    ) +
    element.content
      .map(function (element) {
        return makeRun(element, conspicuous)
      })
      .join('')
  )
  function makeRun (element, conspicuous) {
    return run(element, numberStyle, conspicuous, blanks, markFilled, styles)
  }
}
