JSZip = require 'jszip'

templates = require './templates'

trim = do ->
  if String.prototype.trim
    (s) -> s.trim()
  else
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
    (s) -> s.replace(rtrim, '')

zipObject = (zip, object) ->
  for own path, content of object
    if typeof content == 'string'
      # file
      console.log path
      zip.file(path, trim(content))
    else
      # folder
      folder = zip.folder(path)
      zipObject(folder, content)
  zip

module.exports.generate = (title, input) ->
  tree = require './scaffold.json'
  tree.word['document.xml'] = templates.document('Empty Document', [])

  zip = new JSZip()
  zipObject(zip, tree)
  zip
