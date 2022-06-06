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
  element, numberStyle, indentMargins, blanks, markFilled, styles, hrefs
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
        ? componentToContent(element, hrefs)
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

function componentToContent (component, hrefs) {
  var url = component.component + '/' + component.version
  var returned = ['Incorporate ']
  hrefs.push(url)
  var id = 'rId' + (100 + (hrefs.length - 1))
  returned.push(
    '<w:hyperlink r:id="' + id + '">' +
    '<w:r>' +
    '<w:rPr>' +
    '<w:rStyle w:val="Hyperlink"/>' +
    '</w:rPr>' +
    '<w:t>' + escape(url) + '</w:t>' +
    '</w:r>' +
    '</w:hyperlink>'
  )
  var substitutions = component.substitutions
  var hasSubstitutions = (
    Object.keys(substitutions.terms).length > 0 ||
    Object.keys(substitutions.headings).length > 0
  )
  if (hasSubstitutions) {
    returned.push(', replacing ')
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
  }
  return returned
}
