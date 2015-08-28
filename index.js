var JSZip = require('jszip')

var doc = require('./templates/document')

var zipObject = function(zip, object) {
  Object.keys(object).forEach(function(path) {
    var content = object[path]
    // File
    if (typeof content === 'string') {
      zip.file(path, content.trim()) }
    // Folder
    else {
      zipObject(zip.folder(path), content) } }) }

module.exports = function(form, values, options) {
  var title = options.title
  var numberStyle = options.number
  var scaffold = require('./data/scaffold.json')
  scaffold.word['document.xml'] = doc(form, values, title, numberStyle)
  var zip = new JSZip()
  zipObject(zip, scaffold)
  return zip }
