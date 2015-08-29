var tag = require('./tag')
var run = require('./run')

// Half an inch in twentieths of a point
var HALF_INCH = 720

var alignments = {
  left: 'start',
  right: 'end',
  center: 'center',
  justify: 'both',
  distribute: 'distribute' }

var properties = function(o) {
  // CAVEAT: The order of properties is important.
  var depth = (
    'heading' in o || 'numbering' in o ?
      o.depth :
      o.depth + 1 )
  var alignment = o.alignment
  return tag('w:pPr',
    '<w:ind w:firstLine="' + ( ( depth - 1 ) * HALF_INCH ) + '" />' +
    '<w:jc w:val="' + alignments[alignment] + '" />') }

var TAB = '<w:r><w:tab/></w:r>'

module.exports = function(element, numberStyle) {
  if (!element.hasOwnProperty('alignment')) {
    element.alignment = 'justify' }
  var number = element.hasOwnProperty('numbering') ?
    numberStyle(element.numbering, true) : ''
  var conspicuous = element.hasOwnProperty('conspicuous')
  return tag('w:p',
    properties(element) +
    ( number ? run(number, numberStyle, false) + TAB : '') +
    ( element.hasOwnProperty('heading') ?
      run(
        { text: element.heading, underline: true },
        numberStyle,
        false) +
      run({ text: '. ' }, numberStyle, false) :
      '' ) +
    element.content
      .map(function(element) {
        return run(element, numberStyle, conspicuous) })
      .join('')) }
