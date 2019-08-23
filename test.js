var decimal = require('decimal-numbering')
var docx = require('./')
var tape = require('tape')
var textract = require('textract')

var NO_BLANKS, NO_OPTIONS

tape('renders text', function (test) {
  render(
    { content: ['Hello!'] },
    NO_BLANKS,
    NO_OPTIONS,
    function (error, buffer) {
      test.ifError(error, 'no render error')
      textOf(buffer, function (error, text) {
        test.ifError(error, 'no textract error')
        test.assert(
          text.indexOf('Hello') > -1,
          'text appears in output'
        )
        test.end()
      })
    }
  )
})

tape('renders definitions', function (test) {
  render(
    { content: [{ definition: 'Agreement' }] },
    NO_BLANKS,
    NO_OPTIONS,
    function (error, buffer) {
      test.ifError(error, 'no render error')
      textOf(buffer, function (error, text) {
        test.ifError(error, 'no textract error')
        test.assert(
          text.indexOf('Agreement') > -1,
          'defined term appears in output'
        )
        test.end()
      })
    }
  )
})

tape('renders uses', function (test) {
  render(
    { content: [{ use: 'Agreement' }] },
    NO_BLANKS,
    NO_OPTIONS,
    function (error, buffer) {
      test.ifError(error, 'no render error')
      textOf(buffer, function (error, text) {
        test.ifError(error, 'no textract error')
        test.assert(
          text.indexOf('Agreement') > -1,
          'term appears in output'
        )
        test.end()
      })
    }
  )
})

tape('renders references', function (test) {
  var form = {
    content: [
      {
        heading: 'B',
        form: { content: ['First'] }
      },
      {
        heading: 'A',
        form: { content: [{ reference: 'B' }] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('(B)') > -1,
        'reference appears in output'
      )
      test.end()
    })
  })
})

tape('omits period after heading ending w/ period', function (test) {
  var form = {
    content: [
      {
        heading: 'Ends with period.',
        form: { content: ['Some text.'] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('.. ') === -1,
        'double period does not appear in output'
      )
      test.end()
    })
  })
})

tape('renders broken references', function (test) {
  var form = {
    content: [
      {
        heading: 'A',
        form: { content: [{ reference: 'B' }] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_BLANKS, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('Broken Cross') > -1,
        'reference appears in output'
      )
      test.end()
    })
  })
})

tape('fills blanks', function (test) {
  var form = { content: [{ blank: '' }] }
  var blanks = [{ blank: ['content', 0], value: 'Hello' }]
  render(form, blanks, NO_OPTIONS, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('Hello') > -1,
        'value appears in output'
      )
      test.end()
    })
  })
})

tape('renders empty blank placeholders', function (test) {
  var form = { content: ['A ', { blank: '' }, ' B'] }
  render(form, NO_BLANKS, NO_OPTIONS, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('[') > -1,
        'placeholder appears in output'
      )
      test.end()
    })
  })
})

tape('renders custom empty blank placeholders', function (test) {
  var form = { content: ['A ', { blank: '' }, ' B'] }
  var options = { blanks: { text: '________' } }
  render(form, NO_BLANKS, options, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('________') > -1,
        'placeholder appears in output'
      )
      test.end()
    })
  })
})

tape('renders custom empty blank placeholders', function (test) {
  var form = { content: ['A ', { blank: '' }, ' B'] }
  var options = { blanks: '________' }
  render(form, NO_BLANKS, options, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('________') > -1,
        'placeholder appears in output'
      )
      test.end()
    })
  })
})

tape('renders conspicuous text', function (test) {
  var form = { conspicuous: 'yes', content: ['Hello'] }
  render(form, NO_BLANKS, NO_OPTIONS, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('Hello') > -1,
        'conspicuous text appears in output'
      )
      test.end()
    })
  })
})

tape('renders titles', function (test) {
  var form = { content: ['Hello'] }
  var options = { numbering: decimal, title: 'The Title!' }
  render(form, NO_BLANKS, options, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      test.end()
    })
  })
})

tape('renders centered titles', function (test) {
  var form = { content: ['Hello'] }
  var options = {
    numbering: decimal,
    title: 'The Title!',
    centerTitle: true
  }
  render(form, NO_BLANKS, options, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      test.end()
    })
  })
})

tape('renders editions', function (test) {
  var form = { content: ['Hello'] }
  var options = {
    numbering: decimal,
    title: 'The Title!',
    edition: 'First'
  }
  render(form, NO_BLANKS, options, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('First') > -1,
        'edition appears in output'
      )
      test.end()
    })
  })
})

tape('renders hashes', function (test) {
  var hash = (
    '5a5e1027b2e2ca0a97f97b3239484dae' +
    'f047e0fdd0f652067254227096207032'
  )
  var form = { content: ['Hello'] }
  var options = {
    numbering: decimal,
    title: 'The Title!',
    hash: true
  }
  render(form, NO_BLANKS, options, function (error, buffer) {
    test.ifError(error, 'no render error')
    textOf(buffer, function (error, text) {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf(hash) > -1,
        'hash symbol appears in output'
      )
      test.end()
    })
  })
})

tape('throws for invalid content', function (test) {
  var form = { content: [{ nonsense: 'here' }] }
  test.throws(
    function () {
      docx(form, [], { numbering: decimal })
    },
    /Invalid content/,
    'throw an error')
  test.end()
})

function textOf (buffer, callback) {
  textract.fromBufferWithMime(MIME, buffer, callback)
}

var MIME = [
  'application/vnd',
  'openxmlformats-officedocument',
  'wordprocessingml',
  'document'
].join('.')

function render (form, blanks, options, callback) {
  blanks = blanks || []
  options = options || { numbering: decimal }
  return docx(form, blanks, options)
    .generateAsync({ type: 'nodebuffer' })
    .catch(callback)
    .then(function (buffer) {
      callback(null, buffer)
    })
}
