JSZip = require 'jszip'

templates = require './templates'
{trim} = require './util'

zipObject = (zip, object) ->
  for own path, content of object
    if typeof content == 'string'
      # file
      zip.file(path, trim(content))
    else
      # folder
      folder = zip.folder(path)
      zipObject(folder, content)
  zip

module.exports.generate = (title, input) ->
  tree = require './data/scaffold.json'
  tree.word['document.xml'] = templates.document('Empty Document', [])

  zip = new JSZip()
  zipObject(zip, tree)
  zip
