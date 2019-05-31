#!/usr/bin/env node
var docopt = require('@kemitchell/docopt').docopt
var fs = require('fs')
var path = require('path')

// Parse arguments and options.

var usage = [
  'Usage:',
  '  commonform-docx [options] <FILE> [<DIRECTIONS>]',
  '',
  'Options:',
  '  -h, --help                    Show this screen.',
  '  -v, --version                 Show version.',
  '  -H, --hash                    Render form hash',
  '  -e EDITION, --edition EDITION Form edition to be rendered',
  '  -i, --indent-margins          Indent margins, commonwealth style',
  '  -l, --left-align-title        Align title flush to left margin',
  '  -n STYLE, --number STYLE      Numbering style [default: decimal]',
  '  -s PAGES, --signatures PAGES  Signature page data',
  '  -t TITLE, --title TITLE       Render title as <h1>.',
  '  -y JSON, --styles JSON        Render with custom styles.'
].join('\n')

var parsed = docopt(usage, { version: require('./package.json').version })

// Parse arguments and options.

var form = readJSON(parsed['<FILE>'])

var directions = parsed['<DIRECTIONS>']
  ? readJSON(parsed['<DIRECTIONS>'])
  : {}

var options = {}

if (parsed['--title']) options.title = parsed['--title']

if (parsed['--number']) {
  var numberStyle = parsed['--number']
  var supportedNumberingStyles = {
    rse: 'resolutions-schedules-exhibits-numbering',
    ase: 'agreement-schedules-exhibits-numbering',
    pae: 'plan-addenda-exhibits-numbering',
    decimal: 'decimal-numbering',
    outline: 'outline-numbering'
  }
  if (!supportedNumberingStyles.hasOwnProperty(numberStyle)) {
    process.stderr.write([
      '"' + numberStyle + '" is not a valid numbering style.',
      'Valid styles are ' +
      Object.keys(supportedNumberingStyles).map(function (s) {
        return '"' + s + '"'
      }).join(', ') + '.'
    ].join('\n') + '\n')
    process.exit(1)
  } else {
    options.numbering = require(supportedNumberingStyles[numberStyle])
  }
} else {
  options.numbering = require('decimal-numbering')
}

if (parsed['--signatures']) {
  options.after = require('ooxml-signature-pages')(
    JSON.parse(fs.readFileSync(parsed['--signatures']))
  )
}

if (parsed['--styles']) {
  options.styles = JSON.parse(fs.readFileSync(parsed['--styles']))
}

if (parsed['--title']) options.title = parsed['--title']

if (parsed['--edition']) options.edition = parsed['--edition']

if (parsed['--hash']) options.hash = true

options.indentMargins = parsed['--indent-margins']

options.centerTitle = !parsed['--left-align-title']

if (parsed['--blank-text']) options.blanks = parsed['--blank-text']

if (parsed['--mark-filled']) options.markFilled = true

function readJSON (file) {
  return JSON.parse(fs.readFileSync(path.resolve(file)))
}

// Render and print.
var rendered = require('./')(form, directions, options)

process.stdout.write(rendered.generate({ type: 'nodebuffer' }))
