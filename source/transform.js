// var number = require('commonform-number');
// var validate = require('commonform-validate');

var toRun = function(content) {
  switch (content.type) {
    case 'span':
      return {text: content.text};
    case 'definition':
      return {bold: true, text: content.text};
    case 'reference':
      return {underline: true, text: content.text};
    case 'blank':
      return {text: '__________'};
    default:
      throw Error('Unknown content type: ' + JSON.stringify(content));
  }
};

module.exports = function(flattenedProject) {
  return flattenedProject.form.content.reduce(function(pars, element) {
    switch (element.type) {
      case 'title':
        return {
          alignment: 'center',
          indentation: 1,
          content: [{bold: true, text: element.text}]
        };
      case 'paragraph':
        return {
          indentation: element.depth,
          content: element.content.map(function(elem) {
            return toRun(elem);
          })
        };
      default:
        throw new Error('Unknown type' + element.type);
    }
  });
};
