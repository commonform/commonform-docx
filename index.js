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
      zipObject(zip.folder(path), content) } })
}

module.exports = function(form, values, options) {
  if (options === undefined) {
    options = { } }
  var title = (
    options.hasOwnProperty('title') ?
      options.title : 'Untitled' )
  var scaffold = require('./data/scaffold.json')
  scaffold.word['document.xml'] = doc(form, values, title)
  var zip = new JSZip()
  zipObject(zip, scaffold)
  return zip }
