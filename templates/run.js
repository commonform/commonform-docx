var escape = require('../escape')
var merge = require('merge')
var tag = require('./tag')

var defaults = {
  highlight: false,
  bold: false,
  italic: false,
  underline: false }

var underlineFlag = function(underline) {
  return (
    '<w:u w:val="' +
    ( underline ? 'single' : 'none' ) +
    '"/>' ) }

var highlightFlag = function(highlight) {
  return ( '<w:highlight w:val="' + highlight + '"/>' ) }

var flag = function(name, value) {
  return ( value ? '<w:' + name + '/>' : '' ) }

var runProperties = function(options) {
  return tag('w:rPr',
    ( flag('b', ( options.bold || false )) +
      flag('i', ( options.italic || false )) +
      ( options.highlight ? highlightFlag(options.highlight) : '' ) +
      underlineFlag(( options.underline || false )) )) }

var runText = function(text) {
  return '<w:t xml:space="preserve">' + escape(text) + '</w:t>' }

module.exports = function run(element, numberStyle, conspicuous) {
  var properties = merge(true, defaults)
  if (conspicuous === true) {
    properties.italic = true
    properties.bold = true }
  var text = ''
  /* istanbul ignore else */
  if (typeof element === 'string') {
    text = element }
  else if (element.hasOwnProperty('caption')) {
    text = element.caption
    properties.underline = true }
  else if (element.hasOwnProperty('title')) {
    text = element.title
    properties.bold = true }
  else if (element.hasOwnProperty('definition')) {
    var term = element.definition
    return (
      run('"', numberStyle, conspicuous) +
      tag('w:r', runProperties({ bold: true }) + runText(term)) +
      run('"', numberStyle, conspicuous) ) }
  else if (element.hasOwnProperty('blank')) {
    if (element.blank !== undefined) {
      text = element.blank }
    else {
      text = '[•]'
      properties.highlight = 'yellow' } }
  else if (element.hasOwnProperty('use')) {
    text = element.use }
  else if (element.hasOwnProperty('heading')) {
    var numbering = element.numbering
    var heading = element.heading
    if (
      element.hasOwnProperty('broken') ||
      element.hasOwnProperty('ambiguous') )
    { text = '[Broken Cross-Reference to "' + heading + '"]'
      properties.highlight = 'red' }
    else {
      text = numberStyle(numbering)
      properties.underline = true
      return (
        // Underlined reference.
        tag('w:r', runProperties(properties) + runText(text)) +
        // Name of referenced section in parentheses.
        run(' (' + heading + ')', numberStyle, false) ) } }
  else {
    throw new Error(
      'Invalid type: ' + JSON.stringify(element, null, 2)) }
  return tag('w:r', runProperties(properties) + runText(text)) }
