var merge = require('util-merge');

var tag = require('./tag');
var run = require('./run');

var DEFAULTS = {
  alignment: 'justify'
};

// Half an inch in twentieths of a point
var HALF_INCH = 720;

var ALIGNMENTS = {
  left: 'start',
  right: 'end',
  center: 'center',
  justify: 'both',
  distribute: 'distribute'
};

var properties = function(o) {
  // CAVEAT: The order of properties is important.
  return tag('w:pPr',
    '<w:ind w:firstLine="' + ((o.depth - 1) * HALF_INCH) + '" />' +
    '<w:jc w:val="' + ALIGNMENTS[o.alignment] + '" />'
  );
};

var TAB = '<w:r><w:tab/></w:r>';

module.exports = function(paragraph, numberStyle) {
  var options = merge(DEFAULTS, paragraph);
  var number = options.numbering ?
    numberStyle.provision(options.numbering) :
    '';
  return tag('w:p',
    properties(options) +
    (number ? run(number) + TAB : '') +
    (options.summary ?
      run({text: options.summary, underline: true}, numberStyle) +
      run({text: '. '}, numberStyle) :
      '') +
    options.flattened.map(function(element) {
      return run(element, numberStyle);
    }).join('')
  );
};
