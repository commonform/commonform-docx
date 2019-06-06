#!/usr/bin/env node
if (module.parent) {
  module.exports = bin
} else {
  bin(
    process.stdin,
    process.stdout,
    process.stderr,
    process.argv.slice(2),
    function (status) {
      process.exit(status)
    }
  )
}

function bin (stdin, stdout, stderr, argv, done) {
  var supportedNumberings = {
    rse: 'resolutions-schedules-exhibits-numbering',
    ase: 'agreement-schedules-exhibits-numbering',
    pae: 'plan-addenda-exhibits-numbering',
    decimal: 'decimal-numbering',
    outline: 'outline-numbering'
  }

  require('yargs')
    .scriptName('commonform-docx')
    .option('hash', {
      alias: 'H',
      describe: 'render form digest',
      type: 'boolean'
    })
    .option('indent-margins', {
      alias: 'i',
      describe: 'indent margins, commonwealth style',
      type: 'boolean'
    })
    .option('left-align-title', {
      alias: 'l',
      describe: 'align title flush to left margin',
      type: 'boolean'
    })
    .option('mark-filled', {
      alias: 'm',
      describe: 'mark filled blanks',
      type: 'boolean'
    })
    .option('number', {
      alias: 'n',
      describe: 'numbering style',
      default: 'decimal',
      choices: Object.keys(supportedNumberings)
    })
    .option('title', {
      alias: 't',
      describe: 'form title',
      type: 'string'
    })
    .option('edition', {
      alias: 'e',
      describe: 'form edition',
      type: 'string'
    })
    .option('values', {
      alias: 'v',
      describe: 'JSON file with blank values',
      type: 'string',
      coerce: readJSON,
      demandOption: false
    })
    .option('directions', {
      alias: 'd',
      describe: 'JSON file with directions',
      type: 'string',
      coerce: readJSON,
      demandOption: false
    })
    .implies('directions', 'values')
    .option('signatures', {
      alias: 's',
      describe: 'signature page data',
      type: 'string',
      coerce: readJSON,
      demandOption: false
    })
    .option('styles', {
      alias: 'y',
      describe: 'custom styles',
      type: 'string',
      coerce: readJSON,
      demandOption: false
    })
    .version()
    .help()
    .alias('help', 'h')
    .command(
      '$0 [form]',
      'render Common Forms to Office Open XML (Microsoft Word .docx) format',
      function (yargs) {
        yargs.positional('form', {
          describe: 'Common Form JSON or standard input by default',
          default: '-'
        })
      },
      function (args) {
        // Prepare fill-in-the-blank values.
        var blanks = require('commonform-prepare-blanks')(
          args.values, args.directions
        )

        // Prepare rendering options.
        var options = {
          numbering: require(supportedNumberings[args.number])
        }

        if (args['hash']) options.hash = true
        if (args['indent-margins']) options.indentMargins = true
        if (args['left-align-title']) options.centerTitle = false
        if (args['mark-filled']) options.markFilled = true

        var passthroughs = [ 'title', 'edition', 'styles' ]
        passthroughs.forEach(function (key) {
          if (args[key]) options[key] = args[key]
        })

        if (args['blank-text']) options.blankText = args['blank-text']

        if (args.signatures) {
          options.after = require('ooxml-signature-pages')(args.signatures)
        }

        // Read the form to be rendered.
        var chunks = []
        var input = args.form === '-'
          ? stdin
          : require('fs').createReadStream(args.form)
        input
          .on('data', function (chunk) {
            chunks.push(chunk)
          })
          .once('error', function (error) {
            return fail(error)
          })
          .once('end', function () {
            var buffer = Buffer.concat(chunks)
            try {
              var form = JSON.parse(buffer)
            } catch (error) {
              return fail(error)
            }

            // Render.
            try {
              require('./')(form, blanks, options)
                .generateNodeStream()
                .pipe(stdout)
            } catch (error) {
              return fail(error)
            }
            return done(0)
          })
      }
    )
    .parse(argv)

  function fail (error) {
    stderr.write(error.toString() + '\n')
    done(1)
  }
}

function readJSON (file) {
  return JSON.parse(
    require('fs').readFileSync(
      require('path').normalize(file)
    )
  )
}
