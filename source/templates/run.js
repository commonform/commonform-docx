var merge = require('util-merge');
var smarten = require('smart-quotes');

var tag = require('./tag');

var DEFAULTS = {
  bold: false,
  allCaps: false,
  italic: false,
  smallCaps: false,
  text: '',
  underline: false
};

var XML_SPECIAL = {
  '&amp;': /&/g,
  '&apos;': /'/g,
  '&gt;': />/g,
  '&lt;': /</g,
  '&quot;': /"/g
};

var escape = function(string) {
  return Object.keys(XML_SPECIAL).reduce(function(string, escaped) {
    return string.replace(XML_SPECIAL[escaped], escaped);
  }, string);
};

var flag = function(name, value) {
  value = value || 'true';
  return '<w:' + name + ' w:val="' + value + '"/>';
};

var runProperties = function(options) {
  return tag('w:rPr',
    (options.bold ? flag('b') : '') +
    (options.italic ? flag('i') : '') +
    (options.underline ? flag('u', 'single') : '') +
    (options.allCaps ? flag('caps') : '') +
    (options.smallCaps && !options.allCaps ? flag('smallCaps') : '')
  );
};

var runText = function(options) {
  return (
    '<w:t xml:space="preserve">' +
      escape(smarten(options.text)) +
    '</w:t>'
  );
};

module.exports = function(options) {
  options = merge(DEFAULTS, options);
  return tag('w:r', runProperties(options) + runText(options));
};
