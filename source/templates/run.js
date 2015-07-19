var smarten = require('smart-quotes');
var merge = require('merge');
var tag = require('./tag');

var defaults = {
  bold: false,
  italic: false,
  underline: false
};

var special = {
  '&amp;': /&/g,
  '&apos;': /'/g,
  '&gt;': />/g,
  '&lt;': /</g,
  '&quot;': /"/g
};

var escape = function(string) {
  return Object.keys(special).reduce(function(string, escaped) {
    return string.replace(special[escaped], escaped);
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
    flag('b', options.bold || false) +
    flag('i', options.italic || false) +
    underlineFlag(options.underline || false)
  );
};

var runText = function(text) {
  return '<w:t xml:space="preserve">' + escape(text) + '</w:t>';
};

var BLANK = '__________';

module.exports = function run(element, numberStyle, conspicuous) {
  var properties = merge(true, defaults);
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
      bold: element.bold || false,
      underline: element.underline || false
    };
  } else if (element.hasOwnProperty('definition')) {
    var term = element.definition;
    return run('“', numberStyle, conspicuous) +
      tag('w:r', runProperties({bold: true}) + runText(term)) +
      run('”', numberStyle, conspicuous);
  } else if (element.hasOwnProperty('blank')) {
    text = BLANK;
  } else if (element.hasOwnProperty('numbering')) {
    var numbering = element.numbering;
    var heading = element.heading;
    if (
      element.hasOwnProperty('broken') ||
      element.hasOwnProperty('ambiguous')
    ) {
      text = BLANK;
    } else {
      text = (
        'Section ' + numberStyle(numbering) +
        ' (' + heading + ')'
      );
      properties = {underline: true};
    }
  } else {
    throw new Error(
      'Invalid type: ' + JSON.stringify(element, null, 2)
    );
  }
  return tag('w:r', runProperties(properties) + runText(text));
};
