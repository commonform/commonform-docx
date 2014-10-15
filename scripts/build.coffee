JSZip = require 'jszip'
fs = require 'fs'

INPUT = process.argv[2]
OUTPUT = process.argv[3]

aribtrarilyDeepFolder = (dirs, object) ->
  ret = object
  for dir in dirs
    if ret.hasOwnProperty(dir)
      ret = ret[dir]
    else
      ret = ret[dir] = new Object
  ret

build = (zip, data, object) ->
  object ||= new Object
  for own key, value of data
    # Skip the document.xml file, which we will generate
    continue if key == 'word/document.xml'
    path = key.split '/'
    filename = path.pop()
    parent = aribtrarilyDeepFolder(path, object)
    parent[filename] = zip.file(key).asText()
  object

writeJSON = (zip) ->
  json = build(zip, zip.files)
  fs.writeFile OUTPUT, JSON.stringify(json), (err, data) ->
    throw err if err

fs.readFile INPUT, (err, data) ->
  throw err if err
  zip = new JSZip(data)
  writeJSON(zip)
