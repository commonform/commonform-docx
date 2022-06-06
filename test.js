const decimal = require('decimal-numbering')
const docx = require('./')
const tape = require('tape')
const textract = require('textract')

let NO_BLANKS, NO_OPTIONS

tape('renders text', test => {
  render(
    { content: ['Hello!'] },
    NO_BLANKS,
    NO_OPTIONS,
    (error, buffer) => {
      test.ifError(error, 'no render error')
      textOf(buffer, (error, text) => {
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

tape('renders definitions', test => {
  render(
    { content: [{ definition: 'Agreement' }] },
    NO_BLANKS,
    NO_OPTIONS,
    (error, buffer) => {
      test.ifError(error, 'no render error')
      textOf(buffer, (error, text) => {
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

tape('renders uses', test => {
  render(
    { content: [{ use: 'Agreement' }] },
    NO_BLANKS,
    NO_OPTIONS,
    (error, buffer) => {
      test.ifError(error, 'no render error')
      textOf(buffer, (error, text) => {
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

tape('renders references', test => {
  const form = {
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
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('(B)') > -1,
        'reference appears in output'
      )
      test.end()
    })
  })
})

tape('handles components without headings', test => {
  const form = {
    content: [
      {
        component: 'https://example.com/component',
        version: '1.0.0',
        substitutions: { terms: {}, headings: {} }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    test.end()
  })
})

tape('handles components with substitutions', test => {
  const form = {
    content: [
      {
        component: 'https://example.com/component',
        version: '1.0.0',
        substitutions: {
          terms: { A: 'B' },
          headings: { C: 'D' }
        }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    test.end()
  })
})

tape('omits period after heading ending w/ period', test => {
  const form = {
    content: [
      {
        heading: 'Ends with period.',
        form: { content: ['Some text.'] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('.. ') === -1,
        'double period does not appear in output'
      )
      test.end()
    })
  })
})

tape('adds space between heading and defined term', test => {
  const form = {
    content: [
      {
        heading: 'Heading',
        form: {
          content: [
            { definition: 'Term' }
          ]
        }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.includes('Heading. "Term"'),
        'space between heading and term'
      )
      test.end()
    })
  })
})

tape('adds space between heading and text', test => {
  const form = {
    content: [
      {
        heading: 'Heading',
        form: { content: ['text'] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.includes('Heading. text'),
        'space between heading and text'
      )
      test.end()
    })
  })
})
tape('renders broken references', test => {
  const form = {
    content: [
      {
        heading: 'A',
        form: { content: [{ reference: 'B' }] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_BLANKS, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('Broken Cross') > -1,
        'reference appears in output'
      )
      test.end()
    })
  })
})

tape('fills blanks', test => {
  const form = { content: [{ blank: '' }] }
  const blanks = [{ blank: ['content', 0], value: 'Hello' }]
  render(form, blanks, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('Hello') > -1,
        'value appears in output'
      )
      test.end()
    })
  })
})

tape('custom blank text', test => {
  const form = { content: [{ blank: '' }] }
  const options = { blanks: 'XXX', numberStyle: decimal }
  render(form, NO_BLANKS, options, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('XXX') > -1,
        'value appears in output'
      )
      test.end()
    })
  })
})

tape('renders empty blank placeholders', test => {
  const form = { content: ['A ', { blank: '' }, ' B'] }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('[') > -1,
        'placeholder appears in output'
      )
      test.end()
    })
  })
})

tape('renders custom empty blank placeholders', test => {
  const form = { content: ['A ', { blank: '' }, ' B'] }
  const options = { blanks: { text: '________' } }
  render(form, NO_BLANKS, options, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('________') > -1,
        'placeholder appears in output'
      )
      test.end()
    })
  })
})

tape('renders custom empty blank placeholders', test => {
  const form = { content: ['A ', { blank: '' }, ' B'] }
  const options = { blanks: '________' }
  render(form, NO_BLANKS, options, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('________') > -1,
        'placeholder appears in output'
      )
      test.end()
    })
  })
})

tape('renders conspicuous text', test => {
  const form = { conspicuous: 'yes', content: ['Hello'] }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('Hello') > -1,
        'conspicuous text appears in output'
      )
      test.end()
    })
  })
})

tape('renders titles', test => {
  const form = { content: ['Hello'] }
  const options = { numberStyle: decimal, title: 'The Title!' }
  render(form, NO_BLANKS, options, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      test.end()
    })
  })
})

tape('renders centered titles', test => {
  const form = { content: ['Hello'] }
  const options = {
    numberStyle: decimal,
    title: 'The Title!',
    centerTitle: true
  }
  render(form, NO_BLANKS, options, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      test.end()
    })
  })
})

tape('renders versions', test => {
  const form = { content: ['Hello'] }
  const options = {
    numberStyle: decimal,
    title: 'The Title!',
    version: '1.0.0'
  }
  render(form, NO_BLANKS, options, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf('1.0.0') > -1,
        'version appears in output'
      )
      test.end()
    })
  })
})

tape('renders hashes', test => {
  const hash = (
    '5a5e1027b2e2ca0a97f97b3239484dae' +
    'f047e0fdd0f652067254227096207032'
  )
  const form = { content: ['Hello'] }
  const options = {
    numberStyle: decimal,
    title: 'The Title!',
    hash: true
  }
  render(form, NO_BLANKS, options, (error, buffer) => {
    test.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      test.ifError(error, 'no textract error')
      test.assert(
        text.indexOf(hash) > -1,
        'hash symbol appears in output'
      )
      test.end()
    })
  })
})

tape('throws for invalid content', test => {
  const form = { content: [{ nonsense: 'here' }] }
  test.throws(
    () => {
      docx(form, [], { numberStyle: decimal })
    },
    /Invalid content/,
    'throw an error')
  test.end()
})

function textOf (buffer, callback) {
  textract.fromBufferWithMime(MIME, buffer, callback)
}

const MIME = [
  'application/vnd',
  'openxmlformats-officedocument',
  'wordprocessingml',
  'document'
].join('.')

function render (form, blanks, options, callback) {
  blanks = blanks || []
  options = options || { numberStyle: decimal }
  return docx(form, blanks, options)
    .generateAsync({ type: 'nodebuffer' })
    .catch(callback)
    .then(buffer => callback(null, buffer))
}
