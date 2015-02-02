var merge = require('util-merge');

var tag = require('./tag');
var run = require('./run');

var DEFAULTS = {
  alignment: 'justify',
  indentation: 0,
  number: false,
  summary: false,
  content: []
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
    '<w:ind w:firstLine="' + (o.indentation * HALF_INCH) + '" />' +
    '<w:jc w:val="' + ALIGNMENTS[o.alignment] + '" />'
  );
};

var TAB = '<w:r><w:tab/></w:r>';

module.exports = function(options) {
  options = merge(DEFAULTS, options);
  return tag('w:p',
    properties(options) +
    (options.number ? run({text: options.number}) + TAB : '') +
    (options.summary ?
      run({text: options.summary, bold: true}) +
      run({text: '. '}) : '') +
    options.content.map(run).join('')
  );
};
