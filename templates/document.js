var flatten = require('commonform-flatten')
var hashRun = require('./hash')
var titleRun = require('./title')
var paragraph = require('./paragraph')

var DOCUMENT_XMLNS = (
/* jscs:disable maximumLineLength */
/* jshint ignore: start */
  'xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" ' +
  'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" ' +
  'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
  'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" ' +
  'xmlns:v="urn:schemas-microsoft-com:vml" ' +
  'xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" ' +
  'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
  'xmlns:w10="urn:schemas-microsoft-com:office:word" ' +
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
  'xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" ' +
  'xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" ' +
  'xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" ' +
  'xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" ' +
  'xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" ' +
  'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" '
/* jshint ignore: end */
/* jscs:enable maximumlinelength */
)

function section (a4) {
  var returned = '<w:sectPr>'
  if (a4) {
    returned += '<w:pgSz w:w="11907" w:h="16839"/>'
  } else {
    returned += '<w:pgSz w:w="12240" w:h="15840"/>'
  }
  returned += '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>'
  returned += '<w:cols w:space="720"/>'
  returned += '<w:docGrid w:linePitch="360"/>'
  returned += '</w:sectPr>'
  return returned
}

module.exports = function (
  form, values, title, version, hash,
  centerTitle, leftAlignBody, numberStyle, indentMargins, a4Paper, after, blanks, markFilled, styles
) {
  var hrefs = []
  function rIdForHREF (url) {
    var rId = 'rId' + (100 + (hrefs.length - 1))
    hrefs.push({ rId: rId, url: url })
    return rId
  }
  var paragraphs = flatten(form, values)
    .map(function (element) {
      if (leftAlignBody) element.alignment = 'left'
      return paragraph(
        element, numberStyle, indentMargins, blanks, markFilled, styles, rIdForHREF
      )
    })
    .join('')
  var xml = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document ' + DOCUMENT_XMLNS + '>' +
      '<w:body>' +
        (title ? titleRun(title, centerTitle, styles) : '') +
        (version ? titleRun(version, centerTitle, styles) : '') +
        (hash ? hashRun(hash, centerTitle, styles) : '') +
        paragraphs +
        after +
        section(a4Paper) +
      '</w:body>' +
    '</w:document>'
  )
  return { xml: xml, hrefs: hrefs }
}
