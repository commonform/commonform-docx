var smarten = require('smart-quotes');

var tag = require('./tag');

var DEFAULTS = {
  bold: false,
  italic: false,
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
  }, smarten(string));
};

var underlineFlag = function(underline) {
  return '<w:u w:val="' + (underline ? 'single' : 'none') + '"/>';
};

var flag = function(name, value) {
  return value ? '<w:' + name + '/>' : '';
};

var runProperties = function(options) {
  return tag('w:rPr',
    flag('b', options.bold) +
    flag('i', options.italic) +
    underlineFlag(options.underline)
  );
};

var runText = function(text) {
  return '<w:t xml:space="preserve">' + escape(text) + '</w:t>';
};

var BLANK = '__________';

module.exports = function run(element, numberStyle, conspicuous) {
  var properties = JSON.parse(JSON.stringify(DEFAULTS))
  if (conspicuous === true) {
    properties.italic = true;
    properties.bold = true;
  }
  var text = '';
  if (typeof element === 'string') {
    text = element;
  } else if (element.hasOwnProperty('text')) {
    text = element.text;
    properties = {
      bold: element.bold,
      underline: element.underline
    };
  } else if (element.hasOwnProperty('definition')) {
    var term = element.definition;
    return run('“', numberStyle, conspicuous) +
      tag('w:r', runProperties({bold: true}) + runText(term)) +
      run('”', numberStyle, conspicuous);
  } else if (element.hasOwnProperty('blank')) {
    text = BLANK;
  } else if (element.hasOwnProperty('reference')) {
    if (element.broken || element.ambiguous) {
      text = BLANK;
    } else {
      text = numberStyle.reference(element.reference);
      properties = {underline: true};
    }
  } else {
    throw new Error('Invalid type: ' + JSON.stringify(element, null, 2));
  }
  return tag('w:r', runProperties(properties) + runText(text));
};
