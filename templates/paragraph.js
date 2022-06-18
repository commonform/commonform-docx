const escape = require('../escape')
const has = require('has')
const numberToWords = require('number-to-words-en')
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

function properties (o, number, indentMargins) {
  if (o.title) {
    // Titles don't have margins or indentation.
    return tag('w:pPr', `<w:jc w:val="${alignments[o.alignment]}" />`)
  }
  const depth = ('heading' in o || 'numbering' in o)
    ? o.depth
    : o.depth + 1
  // CAVEAT: The order of properties is important.
  return tag('w:pPr',
    '<w:ind' +
    (
      indentMargins
        ? (
            number.length === 0
              ? (
                  ' w:left="' + ((depth - 2) * HALF_INCH) + '"'
                )
              : (
                  ' w:left="' + ((depth - 1) * HALF_INCH) + '"' +
                  ' w:firstLine="-' + HALF_INCH + '"'
                )
          )
        : (' w:firstLine="' + ((depth - 1) * HALF_INCH) + '"')
    ) + ' />' +
    '<w:jc w:val="' + alignments[o.alignment] + '" />'
  )
}

const TAB = '<w:r><w:tab/></w:r>'

module.exports = (element, options) => {
  if (!has(element, 'alignment')) {
    element.alignment = options.styles.alignment || 'justify'
  }
  const number = has(element, 'numbering')
    ? options.numberStyle(element.numbering, true)
    : ''
  const conspicuous = has(element, 'conspicuous')
  const hasComponent = has(element, 'component')
  const hasContent = has(element, 'content')
  let returned = '<w:p>'
  returned += properties(element, number, options.indentMargins)
  returned += number ? makeRun(number, false) + TAB : ''
  if (has(element, 'heading')) {
    returned += makeRun({ caption: element.heading }, conspicuous)
    if (!/\.$/.test(element.heading)) {
      returned += makeRun('.', false)
    }
    if ((hasComponent && !hasContent) || element.content.length === 0) {
      // pass
    } else {
      returned += makeRun(' ', false)
    }
  }
  if (hasComponent) {
    if (hasContent) {
      const style = options.loadedComponentStyle
      if (style === 'redundant') {
        returned += componentReference(element.reference, element.component)
        returned += makeRun(' ' + options.quoteComponentText)
        returned += '</w:p><w:p>'
        returned += properties(
          Object.assign({}, element, { depth: element.depth + 1 }),
          number,
          options.indentMargins
        )
        returned += childContent({ content: element.content })
      } else if (style === 'inline') {
        returned += childContent({ content: element.content })
      } else if (style === 'reference') {
        returned += componentReference(element.reference, element.component)
      } else {
        throw new Error('Uknown Loaded Component Style: ' + style)
      }
    } else {
      returned += componentReference(element)
    }
  } else {
    returned += childContent(element)
  }
  returned += '</w:p>'
  return returned

  function childContent (element) {
    const conspicuous = has(element, 'conspicuous')
    return element.content
      .map(element => makeRun(element, conspicuous, options))
      .join('')
  }

  function makeRun (element, conspicuous) {
    return run(element, conspicuous, options)
  }

  function componentReference (component, meta) {
    const href = component.component + '/' + component.version
    const returned = [makeRun(options.incorporateComponentText + ' ')]
    const rId = options.rIdForHREF(href)
    const link = '<w:hyperlink r:id="' + rId + '" w:history="1"><w:r><w:rPr><w:color w:val="0000EE"/><w:u w:val="single"/></w:rPr><w:t>' + escape(href) + '</w:t></w:r></w:hyperlink>'
    if (meta) {
      returned.push(
        makeRun(meta.publisher + ' ' + meta.name + ' version ' + meta.version + ' ('),
        link,
        makeRun(')')
      )
    } else {
      returned.push(link)
    }
    const substitutions = component.substitutions
    const hasSubstitutions = (
      Object.keys(substitutions.terms).length > 0 ||
      Object.keys(substitutions.headings).length > 0
    )
    if (hasSubstitutions) {
      returned.push(makeRun(' substituting '))
      const phrases = []
      Object.keys(substitutions.terms).forEach(from => {
        const to = substitutions.terms[from]
        phrases.push(
          makeRun('the term ') +
          makeRun({ use: to }) +
          makeRun(' for the term ') +
          makeRun({ use: from })
        )
      })
      Object.keys(substitutions.headings).forEach(from => {
        const to = substitutions.headings[from]
        phrases.push(
          makeRun('references to ') +
          makeRun({ use: to }) +
          makeRun(' for references to ') +
          makeRun({ use: from })
        )
      })
      Object.keys(substitutions.blanks).forEach(number => {
        const value = substitutions.blanks[number]
        phrases.push(
          makeRun(quote(value)) +
          makeRun(' for the ' + numberToWords.toWordsOrdinal(parseInt(number)) + ' blank')
        )
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
    if (options.smart) return '“' + string + '”'
    else return '"' + string + '"'
  }
}
