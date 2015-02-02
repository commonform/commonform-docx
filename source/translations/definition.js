module.exports = function(definition) {
  var term = definition.definition;
  return [{text: '“'}, {bold: true, text: term}, {text: '”'}];
};
