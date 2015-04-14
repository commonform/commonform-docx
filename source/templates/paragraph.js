var merge = require('merge');
var tag = require('./tag');
var run = require('./run');

var defaults = {alignment: 'justify'};

// Half an inch in twentieths of a point
var HALF_INCH = 720;

var alignments = {
  left: 'start',
  right: 'end',
  center: 'center',
  justify: 'both',
  distribute: 'distribute'
};

var properties = function(o) {
  // CAVEAT: The order of properties is important.
  var depth = o.depth;
  var alignment = o.alignment;
  return tag('w:pPr',
    '<w:ind w:firstLine="' + ((depth - 1) * HALF_INCH) + '" />' +
    '<w:jc w:val="' + alignments[alignment] + '" />'
  );
};

var TAB = '<w:r><w:tab/></w:r>';

module.exports = function(element, numberStyle) {
  var options = merge(defaults, element);
  var number = options.hasOwnProperty('numbering') ?
    numberStyle.provision(options.numbering) : '';
  var conspicuous = options.hasOwnProperty('conspicuous');
  return tag('w:p',
    properties(options) +
    (number ? run(number, numberStyle, conspicuous) + TAB : '') +
    (options.hasOwnProperty('heading') ?
      run(
        {text: options.heading, underline: true},
        numberStyle,
        conspicuous
      ) +
      run({text: '. '}, numberStyle, conspicuous) :
      '') +
    options.content.map(function(element) {
      return run(element, numberStyle, conspicuous);
    }).join('')
  );
};
