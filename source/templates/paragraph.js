var Immutable = require('immutable');

var tag = require('./tag');
var run = require('./run');

var defaults = Immutable.Map({
  alignment: 'justify'
});

// Half an inch in twentieths of a point
var HALF_INCH = 720;

var alignments = Immutable.Map({
  left: 'start',
  right: 'end',
  center: 'center',
  justify: 'both',
  distribute: 'distribute'
});

var properties = function(o) {
  // CAVEAT: The order of properties is important.
  var depth = o.get('depth');
  var alignment = o.get('alignment');
  return tag('w:pPr',
    '<w:ind w:firstLine="' + ((depth - 1) * HALF_INCH) + '" />' +
    '<w:jc w:val="' + alignments.get(alignment) + '" />'
  );
};

var TAB = '<w:r><w:tab/></w:r>';

module.exports = function(element, numberStyle) {
  var options = defaults.mergeDeep(element);
  var number = options.has('numbering') ?
    numberStyle.provision(options.get('numbering').toJS()) :
    '';
  var conspicuous = options.has('conspicuous');
  return tag('w:p',
    properties(options) +
    (number ? run(number, numberStyle, conspicuous) + TAB : '') +
    (options.has('heading') ?
      run(
        Immutable.Map({text: options.get('heading'), underline: true}),
        numberStyle,
        conspicuous
      ) +
      run(Immutable.Map({text: '. '}), numberStyle, conspicuous) :
      '') +
    options.get('content').map(function(element) {
      return run(element, numberStyle, conspicuous);
    }).join('')
  );
};
