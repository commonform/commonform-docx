var Immutable = require('immutable');
var smarten = require('smart-quotes');

var tag = require('./tag');

var map = Immutable.Map.bind(Immutable);

var defaults = map({
  bold: false,
  italic: false,
  underline: false
});

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
    flag('b', options.get('bold', false)) +
    flag('i', options.get('italic', false)) +
    underlineFlag(options.get('underline', false))
  );
};

var runText = function(text) {
  return '<w:t xml:space="preserve">' + escape(text) + '</w:t>';
};

var BLANK = '__________';

module.exports = function run(element, numberStyle, conspicuous) {
  var properties = defaults.withMutations(function(properties) {
    if (conspicuous === true) {
      properties.set('italic', true);
      properties.set('bold', true);
    }
  });
  var text = '';
  if (typeof element === 'string') {
    text = element;
  } else if (element.has('text')) {
    text = element.get('text');
    properties = map({
      bold: element.get('bold', false),
      underline: element.get('underline', false)
    });
  } else if (element.has('definition')) {
    var term = element.get('definition');
    return run('“', numberStyle, conspicuous) +
      tag('w:r', runProperties(map({bold: true})) + runText(term)) +
      run('”', numberStyle, conspicuous);
  } else if (element.has('blank')) {
    text = BLANK;
  } else if (element.has('reference')) {
    if (element.has('broken') || element.has('ambiguous')) {
      text = BLANK;
    } else {
      text = numberStyle.reference(element.get('reference').toJS());
      properties = map({underline: true});
    }
  } else {
    throw new Error('Invalid type: ' + JSON.stringify(element, null, 2));
  }
  return tag('w:r', runProperties(properties) + runText(text));
};
