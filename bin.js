#!/usr/bin/env node
const docopt = require('@kemitchell/docopt').docopt
const fs = require('fs')
const has = require('has')
const path = require('path')

// Parse arguments and options.

const usage = [
  'Usage:',
  '  commonform-docx [options] <FILE>',
  '',
  'Options:',
  '  -h, --help                          Show this screen.',
  '  -v, --version                       Show version.',
  '  -H, --hash                          Render form hash',
  '  -a, --a4-paper                      A4 paper.',
  '  -b TEXT, --blank-text TEXT          Render blanks with custom text.',
  '  --component-style STYLE             Change component style [default: inline]',
  '  -d JSON --directions JSON           Use directions to fill in blanks',
  '  -e VERSION, --form-version VERSION  Form version to be rendered',
  '  -i, --indent-margins                Indent margins, commonwealth style',
  '  --incorporate-component-text TEXT   Verb for component references [default: Incorporate]',
  '  --quote-component-text TEXT         Text for introducing quoted components',
  '  -l, --left-align-title              Align title flush to left margin',
  '  -m, --mark-filled                   Mark filled blanks',
  '  -p, --smart                         Render Unicode punctuation',
  '  -n STYLE, --number STYLE            Numbering style [default: decimal]',
  '  -r --left-align-body                Left-align body paragraphs.',
  '  -s PAGES, --signatures PAGES        Signature page data',
  '  -t TITLE, --title TITLE             Render title as <h1>.',
  '  -v JSON --values JSON               Use values to fill in blanks',
  '  -y JSON, --styles JSON              Render with custom styles.'
].join('\n')

const parsed = docopt(usage, { version: require('./package.json').version })

// Parse arguments and options.

const form = readJSON(parsed['<FILE>'])

const values = parsed['--values'] ? readJSON(parsed['--values']) : {}
const directions = parsed['--directions'] ? readJSON(parsed['--directions']) : []
const blanks = require('commonform-prepare-blanks')(values, directions)

const options = {}

if (parsed['--title']) options.title = parsed['--title']

if (parsed['--number']) {
  const numberStyle = parsed['--number']
  const supportedNumberingStyles = {
    rse: 'resolutions-schedules-exhibits-numbering',
    ase: 'agreement-schedules-exhibits-numbering',
    pae: 'plan-addenda-exhibits-numbering',
    decimal: 'decimal-numbering',
    outline: 'outline-numbering'
  }
  if (!has(supportedNumberingStyles, numberStyle)) {
    process.stderr.write([
      `"${numberStyle}" is not a valid numbering style.`,
      'Valid styles are ' +
      Object.keys(supportedNumberingStyles)
        .map(s => `"${s}"`)
        .join(', ') + '.'
    ].join('\n') + '\n')
    process.exit(1)
  } else {
    options.numberStyle = require(supportedNumberingStyles[numberStyle])
  }
} else {
  options.numberStyle = require('decimal-numbering')
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

if (parsed['--form-version']) options.version = parsed['--form-version']

if (parsed['--hash']) options.hash = true

if (parsed['--a4-paper']) options.a4 = true

options.indentMargins = parsed['--indent-margins']

options.leftAlignTitle = parsed['--left-align-title']

options.leftAlignBody = parsed['--left-align-body']

options.smart = !!parsed['--smart']

if (parsed['--blank-text']) options.blanks = parsed['--blank-text']

if (parsed['--mark-filled']) options.markFilled = true

options.componentStyle = parsed['--component-style']
if (parsed['--quote-component-text']) options.quoteComponentText = parsed['--quote-component-text']
options.incorporateComponentText = parsed['--incorporate-component-text']

function readJSON (file) {
  return JSON.parse(fs.readFileSync(path.resolve(file)))
}

// Render and print.
const rendered = require('./')(form, blanks, options)

rendered.generateNodeStream().pipe(process.stdout)
