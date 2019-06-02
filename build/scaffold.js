var JSZip = require('jszip')
var fs = require('fs')
var runSeries = require('run-series')

var INPUT = process.argv[2]

fs.readFile(INPUT, function (error, data) {
  if (error) throw error
  JSZip.loadAsync(data).then(function (zip) {
    writeJSON(zip)
  })
})

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

function build (zip, data, callback) {
  var object = {}
  runSeries(
    Object.keys(data).map(function (key) {
      return function (done) {
        if (key === 'word/document.xml') return done()
        var path = key.split('/')
        var filename = path.pop()
        var parent = arbitrarilyDeepFolder(path, object)
        zip
          .file(key)
          .async('string')
          .catch(done)
          .then(function (string) {
            parent[filename] = string
            done()
          })
      }
    }),
    function (error) {
      if (error) return callback(error)
      callback(null, object)
    }
  )
}

function writeJSON (zip) {
  build(zip, zip.files, function (error, result) {
    if (error) throw error
    process.stdout.write(JSON.stringify(result))
  })
}
