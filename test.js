var fs = require('fs')
var docx = require('./')

var input = fs.readFileSync('/dev/stdin')
var output = docx(
  JSON.parse(input),
  { },
  { numbering: require('decimal-numbering') })

process.stdout
  .write(output.generate({type: 'nodebuffer'}))
