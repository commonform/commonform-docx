var JSZip = require('jszip');

var doc = require('./templates/document');

var zipObject = function(zip, object) {
  Object.keys(object).forEach(function(path) {
    var content = object[path];
    if (typeof content === 'string') { // File
      zip.file(path, content.trim());
    } else { // Folder
      zipObject(zip.folder(path), content);
    }
  });
};

module.exports = function(title, paragraphs) {
  var tree = require('../data/scaffold.json');
  tree.word['document.xml'] = doc(title, paragraphs);
  var zip = new JSZip();
  zipObject(zip, tree);
  return zip;
};
