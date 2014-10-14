templates = require '../templates'
faker = require 'faker'

someWords = -> faker.lorem.words().join(' ')

trim = (string) -> string.replace(/\n\s*/g,'')

describe 'templating of', ->

  describe 'text runs', ->

    it 'creates tags', ->
      TEXT = someWords()
      expected = "<w:r><w:t>#{TEXT}</w:t></w:r>"
      result = trim(templates.text(TEXT))
      result.should.eql expected

    it 'preserves whitespace', ->
      TEXT = someWords()
      (templates.text(TEXT + ' ').indexOf('preserve') > -1).should.be.true
      (templates.text(' ' + TEXT).indexOf('preserve') > -1).should.be.true
      (templates.text(' ' + TEXT + ' ').indexOf('preserve') > -1).should.be.true
      (templates.text(TEXT).indexOf('preserve') > -1).should.be.false

    it 'escapes special characters', ->
      trim(templates.text('You & Me')).should.eql(
        "<w:r><w:t>You &amp; Me</w:t></w:r>"
      )

  describe 'paragraphs', ->

  describe 'documents', ->

    it 'includes the title', ->
      TITLE = someWords()
      PARS = []
      (templates.document(TITLE, PARS).indexOf(TITLE) > -1).should.be.true
