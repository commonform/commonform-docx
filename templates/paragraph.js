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
  var component = has(element, 'repository')
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
        ? componentToContent(element)
          .map(function (element) {
            return makeRun(element, conspicuous)
          })
          .join('')
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
}

function componentToContent (component) {
  var url = 'https://' + [
    component.repository,
    component.publisher,
    component.project,
    component.edition
  ].map(encodeURIComponent).join('/')
  var returned = []
  var substitutions = component.substitutions
  var hasSubstitutions = (
    Object.keys(substitutions.terms).length > 0 ||
    Object.keys(substitutions.headings).length > 0
  )
  var firstString = url
  if (hasSubstitutions) {
    if (component.upgrade) firstString += ' with updates and corrections, replacing '
    else firstString += ' replacing '
    returned.push(firstString)
    var substitutionContent = []
    Object.keys(substitutions.terms).forEach(function (from) {
      var to = substitutions.terms[from]
      substitutionContent.push(from + ' with ', { use: to })
    })
    Object.keys(substitutions.headings).forEach(function (from) {
      var to = substitutions.headings[from]
      substitutionContent.push(from + ' with ', { referene: to })
    })
    var length = substitutionContent.length
    for (var index = 2; index < length - 1; index += 2) {
      substitutionContent[index] = ', ' + substitutionContent[index]
    }
    substitutionContent.forEach(function (element) {
      returned.push(element)
    })
  } else {
    if (component.upgrade) firstString += ' with updates and corrections'
    returned.push(firstString)
  }
  return returned
}
