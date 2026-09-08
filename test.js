import decimal from 'decimal-numbering'
import docx from './index.js'
import test from 'node:test'
import assert from 'node:assert'
import textract from 'textract'
import JSZip from 'jszip'

let NO_BLANKS, NO_OPTIONS

test('renders text', (t, done) => {
  render(
    { content: ['Hello!'] },
    NO_BLANKS,
    NO_OPTIONS,
    (error, buffer) => {
      assert.ifError(error, 'no render error')
      textOf(buffer, (error, text) => {
        assert.ifError(error, 'no textract error')
        assert(
          text.indexOf('Hello') > -1,
          'text appears in output'
        )
        done()
      })
    }
  )
})

test('renders definitions', (t, done) => {
  render(
    { content: [{ definition: 'Agreement' }] },
    NO_BLANKS,
    NO_OPTIONS,
    (error, buffer) => {
      assert.ifError(error, 'no render error')
      textOf(buffer, (error, text) => {
        assert.ifError(error, 'no textract error')
        assert(
          text.indexOf('Agreement') > -1,
          'defined term appears in output'
        )
        done()
      })
    }
  )
})

test('renders uses', (t, done) => {
  render(
    { content: [{ use: 'Agreement' }] },
    NO_BLANKS,
    NO_OPTIONS,
    (error, buffer) => {
      assert.ifError(error, 'no render error')
      textOf(buffer, (error, text) => {
        assert.ifError(error, 'no textract error')
        assert(
          text.indexOf('Agreement') > -1,
          'term appears in output'
        )
        done()
      })
    }
  )
})

test('renders references', (t, done) => {
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
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('(B)') > -1,
        'reference appears in output'
      )
      done()
    })
  })
})

test('handles components without headings', (t, done) => {
  const form = {
    content: [
      {
        component: 'https://example.com/component',
        version: '1.0.0',
        substitutions: { terms: {}, headings: {}, blanks: {} }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    assert.ifError(error, 'no render error')
    done()
  })
})

test('handles components with substitutions', (t, done) => {
  const form = {
    content: [
      {
        component: 'https://example.com/component',
        version: '1.0.0',
        substitutions: {
          terms: { A: 'B' },
          headings: { C: 'D' },
          blanks: {}
        }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    assert.ifError(error, 'no render error')
    done()
  })
})

test('omits period after heading ending w/ period', (t, done) => {
  const form = {
    content: [
      {
        heading: 'Ends with period.',
        form: { content: ['Some text.'] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('.. ') === -1,
        'double period does not appear in output'
      )
      done()
    })
  })
})

test('adds space between heading and defined term', (t, done) => {
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
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.includes('Heading. "Term"'),
        'space between heading and term'
      )
      done()
    })
  })
})

test('adds space between heading and text', (t, done) => {
  const form = {
    content: [
      {
        heading: 'Heading',
        form: { content: ['text'] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.includes('Heading. text'),
        'space between heading and text'
      )
      done()
    })
  })
})

test('renders broken references', (t, done) => {
  const form = {
    content: [
      {
        heading: 'A',
        form: { content: [{ reference: 'B' }] }
      }
    ]
  }
  render(form, NO_BLANKS, NO_BLANKS, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('Broken Cross') > -1,
        'reference appears in output'
      )
      done()
    })
  })
})

test('fills blanks', (t, done) => {
  const form = { content: [{ blank: '' }] }
  const blanks = [{ blank: ['content', 0], value: 'Hello' }]
  render(form, blanks, NO_OPTIONS, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('Hello') > -1,
        'value appears in output'
      )
      done()
    })
  })
})

test('custom blank text', (t, done) => {
  const form = { content: [{ blank: '' }] }
  const options = { blanks: 'XXX', numberStyle: decimal }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('XXX') > -1,
        'value appears in output'
      )
      done()
    })
  })
})

test('renders empty blank placeholders', (t, done) => {
  const form = { content: ['A ', { blank: '' }, ' B'] }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('[') > -1,
        'placeholder appears in output'
      )
      done()
    })
  })
})

test('renders custom empty blank placeholders', (t, done) => {
  const form = { content: ['A ', { blank: '' }, ' B'] }
  const options = { blanks: { text: '________' } }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('________') > -1,
        'placeholder appears in output'
      )
      done()
    })
  })
})

test('renders custom empty blank placeholders', (t, done) => {
  const form = { content: ['A ', { blank: '' }, ' B'] }
  const options = { blanks: '________' }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('________') > -1,
        'placeholder appears in output'
      )
      done()
    })
  })
})

test('renders conspicuous text', (t, done) => {
  const form = { conspicuous: 'yes', content: ['Hello'] }
  render(form, NO_BLANKS, NO_OPTIONS, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('Hello') > -1,
        'conspicuous text appears in output'
      )
      done()
    })
  })
})

test('renders titles', (t, done) => {
  const form = { content: ['Hello'] }
  const options = { numberStyle: decimal, title: 'The Title!' }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      done()
    })
  })
})

test('renders centered titles by default', (t, done) => {
  const form = { content: ['Hello'] }
  const options = {
    numberStyle: decimal,
    title: 'The Title!'
  }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      done()
    })
  })
})

test('accepts option for left-align title', (t, done) => {
  const form = { content: ['Hello'] }
  const options = {
    numberStyle: decimal,
    title: 'The Title!',
    leftAlignTitle: true
  }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('The Title!') > -1,
        'title appears in output'
      )
      done()
    })
  })
})

test('accepts font and font size options', (t, done) => {
  const form = { content: ['Hello'] }
  const options = { font: 'Arial', fontSize: 18 }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    JSZip.loadAsync(buffer)
      .then(zip => {
        return zip.file('word/styles.xml').async('string')
      })
      .then(styles => {
        assert(
          styles.indexOf(options.font) !== -1,
          'font appears in styles.xml'
        )
        assert(
          styles.indexOf(`w:val="${options.fontSize * 2}"`) !== -1,
          'font size in half-points apopears in styles.xml'
        )
        done()
      })
  })
})

test('renders versions', (t, done) => {
  const form = { content: ['Hello'] }
  const options = {
    numberStyle: decimal,
    title: 'The Title!',
    version: '1.0.0'
  }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf('1.0.0') > -1,
        'version appears in output'
      )
      done()
    })
  })
})

test('renders hashes', (t, done) => {
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
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf(hash) > -1,
        'hash symbol appears in output'
      )
      done()
    })
  })
})

test('includes before', (t, done) => {
  const form = { content: ['test'] }
  const magic = 'cumquat'
  const options = {
    before: `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>${magic}</w:t></w:r></w:p>`
  }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf(magic) > -1,
        'text output contains before text'
      )
      done()
    })
  })
})

test('includes after', (t, done) => {
  const form = { content: ['test'] }
  const magic = 'persimmon'
  const options = {
    after: `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>${magic}</w:t></w:r></w:p>`
  }
  render(form, NO_BLANKS, options, (error, buffer) => {
    assert.ifError(error, 'no render error')
    textOf(buffer, (error, text) => {
      assert.ifError(error, 'no textract error')
      assert(
        text.indexOf(magic) > -1,
        'text output contains after text'
      )
      done()
    })
  })
})

test('throws for invalid content', (t, done) => {
  const form = { content: [{ nonsense: 'here' }] }
  assert.throws(
    () => {
      docx(form, [], { numberStyle: decimal })
    },
    /Invalid type/,
    'throw an error'
  )
  done()
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
