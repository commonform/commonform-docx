l = require './index'
fs = require 'fs'
zip = l.generate 'An Empty Agreement', []
options =
  type: 'nodebuffer'
  compression: 'DEFLATE'
fs.writeFileSync 'test.docx', zip.generate(options)
