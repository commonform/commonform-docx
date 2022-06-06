const escape = require('../escape')
const has = require('has')
const run = require('./run')
const tag = require('./tag')

// Half an inch in twentieths of a point
const HALF_INCH = 720

const alignments = {
  left: 'start',
  right: 'end',
  center: 'center',
  justify: 'both',
  distribute: 'distribute'
}

const properties = function (o, number, indentMargins) {
  // CAVEAT: The order of properties is important.
  const depth = ('heading' in o || 'numbering' in o || 'title' in o)
    ? o.depth
    : o.depth + 1
  const alignment = o.alignment
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

const TAB = '<w:r><w:tab/></w:r>'

module.exports = function (
  element, numberStyle, indentMargins, blanks, markFilled, styles, rIdForHREF, smartQuotes
) {
  if (!has(element, 'alignment')) {
    element.alignment = styles.alignment || 'justify'
  }
  const number = has(element, 'numbering')
    ? numberStyle(element.numbering, true)
    : ''
  const conspicuous = has(element, 'conspicuous')
  const hasComponent = has(element, 'component')
  const hasContent = has(element, 'content')
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
          (((hasComponent && !hasContent) || element.content.length === 0) ? '' : makeRun(' ', false))
          )
        : ''
    ) +
    (
      hasComponent
        ? hasContent
          ? (
              referenceContent(element.reference, rIdForHREF) +
            makeRun(' Quoting for convenience, with any conflicts resolved in favor of the standard:') +
            '</w:p>' +
            '<w:p>' +
            properties(
              Object.assign({}, element, { depth: element.depth + 1 }),
              number,
              indentMargins
            ) +
            childContent({ content: element.content })
            )
          : referenceContent(element, rIdForHREF)
        : childContent(element)
    )
  )

  function childContent (element) {
    const conspicuous = has(element, 'conspicuous')
    return element.content
      .map(function (element) {
        return makeRun(element, conspicuous)
      })
      .join('')
  }

  function makeRun (element, conspicuous) {
    return run(element, numberStyle, conspicuous, blanks, markFilled, styles)
  }

  function referenceContent (component, rIdForHREF) {
    const href = component.component + '/' + component.version
    const returned = [makeRun('Incorporate ')]
    const rId = rIdForHREF(href)
    returned.push(
      '<w:hyperlink r:id="' + rId + '" w:history="1"><w:r><w:rPr><w:color w:val="0000EE"/><w:u w:val="single"/></w:rPr><w:t>' + escape(href) + '</w:t></w:r></w:hyperlink>'
    )
    const substitutions = component.substitutions
    const hasSubstitutions = (
      Object.keys(substitutions.terms).length > 0 ||
      Object.keys(substitutions.headings).length > 0
    )
    if (hasSubstitutions) {
      returned.push(makeRun(' substituting '))
      const phrases = []
      Object.keys(substitutions.terms).forEach(function (from) {
        const to = substitutions.terms[from]
        phrases.push(makeRun('the term ' + quote(to) + ' for the term ' + quote(from)))
      })
      Object.keys(substitutions.headings).forEach(function (from) {
        const to = substitutions.headings[from]
        phrases.push(makeRun('references to ' + quote(to) + ' for references to ' + quote(from)))
      })
      const length = phrases.length
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

  function quote (string) {
    if (smartQuotes) return '“' + string + '”'
    else return '"' + string + '"'
  }
}
