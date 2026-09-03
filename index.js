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

module.exports = (form, values = [], options = {}) => {
  let {
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
    fontSize = 12,
    font = 'Times New Roman',
    complete = false,
    numberStyle = decimalNumbering,
    quoteComponentText = 'Quoting for convenience, with any conflicts resolved in favor of the standard:',
    smart,
    styles,
    title,
    version,
    ...rest
  } = options
  const extraKeys = Object.keys(rest)
  if (extraKeys.length !== 0) {
    throw new Error(`Unsupported Options: ${extraKeys.join(', ')}`)
  }
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
      complete,
      numberStyle,
      quoteComponentText,
      smart,
      styles,
      title,
      version
    }
  )
  const scaffold = require('./data/scaffold.json')
  const clone = structuredClone(scaffold)
  clone.word['document.xml'] = result.xml
  clone.word._rels['document.xml.rels'] = docRels(result.hrefs)
  // Set default font size.  We need to replace <w:sz> and <w:szCs>
  // elements both in <w:docDefaults> and in the default style.
  const fontSizeInHalfPoints = Math.floor(fontSize * 2)
  clone.word['styles.xml'] = clone.word['styles.xml']
    .replaceAll(
      /<w:sz w:val="[0-9]+"\/>/g,
      `<w:sz w:val="${fontSizeInHalfPoints}"/>`
    )
    .replaceAll(
      /<w:szCs w:val="[0-9]+"\/>/g,
      `<w:szCs w:val="${fontSizeInHalfPoints}"/>`
    )
  // Set font family the same way.
  if (font !== 'Times New Roman') {
    clone.word['styles.xml'] = clone.word['styles.xml']
      .replaceAll(
        '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>',
        `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>`
      )
  }
  // Set styles for comment bubble text to match main body.
  // It's not exactly clear what each of these styles apply to.  It at
  // least appears that some versions of Word, like 365 and For Mac, use
  // primarily or exclusively the "Balloon" styles, while Word for
  // Windows seems to use primarily the "Comment" styles.
  const rsid = '<w:rsid w:val="009714CB"/>'
  const fontAndSizeTags = `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:sz w:val="${fontSizeInHalfPoints}"/><w:szCs w:val="${fontSizeInHalfPoints}"/>`
  clone.word['styles.xml'] = clone.word['styles.xml']
    .replace(
      '</w:styles>',
      [
        // Balloon Text
        '<w:style w:type="paragraph" w:styleId="BalloonText">',
        '<w:name w:val="Balloon Text"/>',
        '<w:basedOn w:val="Normal"/>',
        '<w:link w:val="BalloonTextChar"/>',
        '<w:uiPriority w:val="99"/>',
        '<w:semiHidden/>',
        '<w:unhideWhenUsed/>',
        rsid,
        '<w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>',
        '<w:rPr>',
        fontAndSizeTags,
        '</w:rPr>',
        '</w:style>',

        // Balloon Text Char
        '<w:style w:type="character" w:customStyle="1" w:styleId="BalloonTextChar">',
        '<w:name w:val="Balloon Text Char"/>',
        '<w:basedOn w:val="DefaultParagraphFont"/>',
        '<w:link w:val="BalloonText"/>',
        '<w:uiPriority w:val="99"/>',
        '<w:semiHidden/>',
        rsid,
        '<w:rPr>',
        fontAndSizeTags,
        '</w:rPr>',
        '</w:style>',

        // Comment Reference
        '<w:style w:type="character" w:styleId="CommentReference">',
        '<w:name w:val="annotation reference"/>',
        '<w:basedOn w:val="DefaultParagraphFont"/>',
        '<w:uiPriority w:val="99"/>',
        '<w:semiHidden/>',
        '<w:unhideWhenUsed/>',
        rsid,
        '<w:rPr>',
        fontAndSizeTags,
        '</w:rPr>',
        '</w:style>',

        // Comment Text
        '<w:style w:type="paragraph" w:styleId="CommentText">',
        '<w:name w:val="annotation text"/>',
        '<w:basedOn w:val="Normal"/>',
        '<w:link w:val="CommentTextChar"/>',
        '<w:uiPriority w:val="99"/>',
        '<w:semiHidden/>',
        '<w:unhideWhenUsed/>',
        rsid,
        '<w:pPr><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>',
        '<w:rPr>',
        fontAndSizeTags,
        '</w:rPr>',
        '</w:style>',

        // Comment Text Char
        '<w:style w:type="character" w:customStyle="1" w:styleId="CommentTextChar">',
        '<w:name w:val="Comment Text Char"/>',
        '<w:basedOn w:val="DefaultParagraphFont"/>',
        '<w:link w:val="CommentText"/>',
        '<w:uiPriority w:val="99"/>',
        '<w:semiHidden/>',
        rsid,
        '<w:rPr>',
        fontAndSizeTags,
        '</w:rPr>',
        '</w:style>',

        // Comment Subject
        '<w:style w:type="paragraph" w:styleId="CommentSubject">',
        '<w:name w:val="annotation subject"/>',
        '<w:basedOn w:val="CommentText"/>',
        '<w:next w:val="CommentText"/>',
        '<w:link w:val="CommentSubjectChar"/>',
        '<w:uiPriority w:val="99"/>',
        '<w:semiHidden/>',
        '<w:unhideWhenUsed/>',
        rsid,
        '<w:rPr>',
        '<w:b/><w:bCs/>',
        fontAndSizeTags,
        '</w:rPr>',
        '</w:style>',

        // Comment Subject Char
        '<w:style w:type="character" w:customStyle="1" w:styleId="CommentSubjectChar">',
        '<w:name w:val="Comment Subject Char"/>',
        '<w:basedOn w:val="CommentTextChar"/>',
        '<w:link w:val="CommentSubject"/>',
        '<w:uiPriority w:val="99"/>',
        '<w:semiHidden/>',
        rsid,
        '<w:rPr>',
        '<w:b/><w:bCs/>',
        fontAndSizeTags,
        '</w:rPr>',
        '</w:style>',

        '</w:styles>'
      ].join('')
    )
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
