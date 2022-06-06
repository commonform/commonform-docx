const JSZip = require('jszip')
const fs = require('fs')
const has = require('has')
const runSeries = require('run-series')

const INPUT = process.argv[2]

fs.readFile(INPUT, (error, data) => {
  if (error) throw error
  JSZip.loadAsync(data).then(zip => writeJSON(zip))
})

function arbitrarilyDeepFolder (directories, object) {
  let returned = object
  directories.forEach(dir => {
    if (has(returned, dir)) {
      returned = returned[dir]
    } else {
      returned = returned[dir] = {}
    }
  })
  return returned
}

function build (zip, data, callback) {
  const object = {}
  runSeries(
    Object.keys(data).map(key => {
      return done => {
        if (key === 'word/document.xml') return done()
        const path = key.split('/')
        const filename = path.pop()
        const parent = arbitrarilyDeepFolder(path, object)
        zip
          .file(key)
          .async('string')
          .catch(done)
          .then(string => {
            parent[filename] = string
            done()
          })
      }
    }),
    error => {
      if (error) return callback(error)
      callback(null, object)
    }
  )
}

function writeJSON (zip) {
  build(zip, zip.files, (error, result) => {
    if (error) throw error
    process.stdout.write(JSON.stringify(result))
  })
}
