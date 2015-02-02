var JSZip = require('jszip');
var fs = require('fs');

var INPUT = process.argv[2];
var OUTPUT = process.argv[3];

var arbitrarilyDeepFolder = function(dirs, object) {
  var ret = object;
  dirs.forEach(function(dir) {
    if (ret.hasOwnProperty(dir)) {
      ret = ret[dir];
    } else {
      ret = ret[dir] = {};
    }
  });
  return ret;
};

var build = function(zip, data, object) {
  object = object || {};
  Object.keys(data).forEach(function(key) {
    var value = data[key];
    if (key === 'word/document.xml') {
      return;
    }
    var path = key.split('/');
    var filename = path.pop();
    var parent = arbitrarilyDeepFolder(path, object);
    parent[filename] = zip.file(key).asText();
  })
  return object;
};

var writeJSON = function(zip) {
  var json = build(zip, zip.files);
  return fs.writeFile(OUTPUT, JSON.stringify(json), function(err, data) {
    if (err) {
      throw err;
    }
  });
};

fs.readFile(INPUT, function(error, data) {
  if (error) {
    throw error;
  }
  var zip = new JSZip(data);
  return writeJSON(zip);
});
