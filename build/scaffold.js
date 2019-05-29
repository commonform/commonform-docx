var JSZip = require('jszip')
var fs = require('fs')

var INPUT = process.argv[2]

function arbitrarilyDeepFolder (directories, object) {
  var returned = object
  directories.forEach(function (dir) {
    if (returned.hasOwnProperty(dir)) {
      returned = returned[dir]
    } else {
      returned = returned[dir] = {}
    }
  })
  return returned
}

function build (zip, data, object) {
  object = object || {}
  Object.keys(data).forEach(function (key) {
    if (key === 'word/document.xml') return
    var path = key.split('/')
    var filename = path.pop()
    var parent = arbitrarilyDeepFolder(path, object)
    parent[filename] = zip.file(key).asText()
  })
  return object
}

function writeJSON (zip) {
  var json = build(zip, zip.files)
  process.stdout.write(JSON.stringify(json))
}

fs.readFile(INPUT, function (error, data) {
  if (error) throw error
  var zip = new JSZip(data)
  writeJSON(zip)
})
