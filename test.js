var decimal = require('decimal-numbering')
var docx = require('./')
var tape = require('tape')
var textract = require('textract')

tape('renders text', function (test) {
  textOf(
    render({content: ['Hello!']}),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('Hello') > -1,
        'text appears in output'
      )
      test.end()
    }
  )
})

tape('renders definitions', function (test) {
  textOf(
    render({content: [{definition: 'Agreement'}]}),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('Agreement') > -1,
        'defined term appears in output')
      test.end()
    }
  )
})

tape('renders uses', function (test) {
  textOf(
    render({content: [{use: 'Agreement'}]}),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('Agreement') > -1,
        'term appears in output')
      test.end()
    }
  )
})

tape('renders references', function (test) {
  var form = {
    content: [
      {
        heading: 'B',
        form: {content: ['First']}
      },
      {
        heading: 'A',
        form: {content: [{reference: 'B'}]}
      }
    ]
  }
  textOf(render(form), function (error, text) {
    test.ifError(error, 'no error')
    test.assert(
      text.indexOf('(B)') > -1,
      'reference appears in output'
    )
    test.end()
  })
})

tape('renders broken references', function (test) {
  var form = {
    content: [
      {
        heading: 'A',
        form: {content: [{reference: 'B'}]}
      }
    ]
  }
  textOf(render(form), function (error, text) {
    test.ifError(error, 'no error')
    test.assert(
      text.indexOf('Broken Cross') > -1,
      'reference appears in output'
    )
    test.end()
  })
})

tape('fills blanks', function (test) {
  textOf(
    render(
      {content: [{blank: ''}]},
      [{blank: ['content', 0], value: 'Hello'}]
    ),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('Hello') > -1,
        'value appears in output'
      )
      test.end()
    }
  )
})

tape('renders empty blank placeholders', function (test) {
  textOf(
    render({content: ['A ', {blank: ''}, ' B']}),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('[') > -1,
        'placeholder appears in output'
      )
      test.end()
    }
  )
})

tape('renders custom empty blank placeholders', function (test) {
  textOf(
    render(
      {content: ['A ', {blank: ''}, ' B']},
      [],
      {blanks: {text: '________'}}
    ),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('________') > -1,
        'placeholder appears in output'
      )
      test.end()
    }
  )
})

tape('renders custom empty blank placeholders', function (test) {
  textOf(
    render(
      {content: ['A ', {blank: ''}, ' B']},
      [],
      {blanks: '________'}
    ),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('________') > -1,
        'placeholder appears in output'
      )
      test.end()
    }
  )
})

tape('renders conspicuous text', function (test) {
  textOf(
    render({conspicuous: 'yes', content: ['Hello']}),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('Hello') > -1,
        'conspicuous text appears in output'
      )
      test.end()
    }
  )
})

tape('renders titles', function (test) {
  textOf(
    render(
      {content: ['Hello']},
      [],
      {numbering: decimal, title: 'The Title!'}
    ),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      test.end()
    }
  )
})

tape('renders centered titles', function (test) {
  textOf(
    render(
      {content: ['Hello']},
      [],
      {
        numbering: decimal,
        title: 'The Title!',
        centerTitle: true
      }
    ),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      test.end()
    }
  )
})

tape('renders editions', function (test) {
  textOf(
    render(
      {content: ['Hello']},
      [],
      {numbering: decimal, title: 'The Title!', edition: 'First'}
    ),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('First') > -1,
        'edition appears in output'
      )
      test.end()
    }
  )
})

tape('renders hashes', function (test) {
  textOf(
    render(
      {content: ['Hello']},
      [],
      {numbering: decimal, title: 'The Title!', hash: 'aaaaa'}
    ),
    function (error, text) {
      test.ifError(error, 'no error')
      test.assert(
        text.indexOf('aaaaa') > -1,
        'hash appears in output'
      )
      test.end()
    }
  )
})

tape('throws for invalid content', function (test) {
  test.throws(
    function () {
      render({content: [{nonsense: 'here'}]})
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

function render (form, blanks, options) {
  blanks = blanks || []
  options = options || {numbering: decimal}
  return docx(form, blanks, options)
  .generate({type: 'nodebuffer'})
}
