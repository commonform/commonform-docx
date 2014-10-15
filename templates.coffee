e =  module.exports

isArray = Array.isArray || (o) ->
  toString.call(o) == '[object Array]'

isFunction = (o) ->
  typeof o == 'function' || false

isString = (o) ->
  typeof o == 'string' || false

HEADING_STYLES = [
  null
  'Heading1'
  'Heading2'
  'Heading3'
  'Heading4'
  'Heading5'
  'Heading6'
]

OTHER_STYLES = [
  'Title'
  'Recital'
  'Lead-In'
  'SignatureBlock'
  'Cross-Reference'
]

XML_SPECIAL_CHARS =
  '&quot;': /"/g
  '&apos;': /'/g
  '&lt;': /</g
  '&gt;': />/g
  '&amp;': /&/g

xmlescape = e.xmlescape = (string) ->
  for escaped, re of XML_SPECIAL_CHARS
    string = string.replace(re, escaped)
  string

surroundedBySpace = (string) ->
  first = string[0]
  last = string[string.length - 1]
  first == ' ' || last == ' '

preserve = 'xml:space="preserve"'


e.content = (input) ->
  if isArray(input)
    (e.content c for c in input).join('')
  else
    if isString(input)
      text(input, null)
    else if input.hasOwnProperty('reference')
      reference(input.reference, input.text)
    else
      text(input.text, input.style)

text = e.text = (t, style) ->
  t = xmlescape(t)
  space = surroundedBySpace(t)

  if style
    """
    <w:r>
      <w:rPr>
        <w:rStyle w:val="#{style}"/>
      </w:rPr>
      <w:t#{if space then ' ' + preserve else ''}>#{t}</w:t>
    </w:r>
    """
  else
    """
    <w:r>
      <w:t#{if space then ' ' + preserve else ''}>#{t}</w:t>
    </w:r>
    """

e.paragraphStyle = (style) ->
  """
  <w:pPr>
    <w:pStyle w:val="#{style}"/>
  </w:pPr>
  """

e.paragraph = (c, style) ->
  """
  <w:p>
    #{e.paragraphStyle(style) if style}
    #{e.content(c)}
  </w:p>
  """

vanish =
  """
  <w:rPr>
    <w:vanish/>
    <w:specVanish/>
  </w:rPr>
  """

bookmark = (name, inside) ->
  name = xmlescape(name)
  """
  <w:bookmarkStart w:id="#{name}" w:name="#{name}"/>
  #{if isFunction(inside) then inside() else inside}
  <w:bookmarkEnd w:id="#{name}"/>
  """

reference = (name, text) ->
  name = xmlescape(name)
  """
  <w:r>
    <w:rPr>
      <w:rStyle w:val="Cross-Reference"/>
    </w:rPr>
    <w:fldChar w:fldCharType="begin"/>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rStyle w:val="Cross-Reference"/>
    </w:rPr>
    <w:instrText xml:space="preserve"> REF #{name} \\w \\h \\* MERGEFORMAT </w:instrText>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rStyle w:val="Cross-Reference"/>
    </w:rPr>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rStyle w:val="Cross-Reference"/>
    </w:rPr>
    <w:fldChar w:fldCharType="separate"/>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rStyle w:val="Cross-Reference"/>
    </w:rPr>
    #{e.text(text)}
  </w:r>
  <w:r>
    <w:rPr>
      <w:rStyle w:val="Cross-Reference"/>
    </w:rPr>
    <w:fldChar w:fldCharType="end"/>
  </w:r>
  """

sectionParagraph = (headingContent, bodyContent, style) ->
  """
  <w:p>
    #{paragraphStyle style if style}
    #{vanish}
    #{bookmark headingContent, -> e.content headingContent}
  </w:p>
  <w:p>
    #{(e.content bodyContent).join('')}
  </w:p>
  """

DOCUMENT_XMLNS = """
xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
xmlns:w10="urn:schemas-microsoft-com:office:word"
xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
"""
e.document = (title, paragraphs) ->
  """
  <w:document #{DOCUMENT_XMLNS}>
    <w:body>
      #{e.paragraph [title], 'Title'}
    </w:body>
  </w:document>
  """

tab = "<w:r><w:tab/></w:r>"

lineBreak = "<w:r><w:br/></w:r>"

entitySignatureBlock = (entity, name, title) ->
  """
    <w:p>
      #{paragraphStyle 'SignatureBlockEntity'}
    </w:p>
    <w:p>
      #{paragraphStyle 'SignatureBlock'}
      #{text('By: ')}
      #{tab}
      #{lineBreak}
      #{text('Name: ')}
      #{if name then text name else tab}
      #{lineBreak}
      #{text('Title: ')}
      #{if title then text title else tab}
    </w:p>
  """

individualSignatureBlock = (name) ->
  """
    <w:p>
      #{paragraphStyle 'SignatureBlock'}
      #{tab}
      #{lineBreak}
      #{e.text(name)}
    </w:p>
  """

pageBreak =
  """
  <w:p>
    <w:pPr>
      <w:spacing w:before="0" w:after="150" w:line="259" w:lineRule="auto"/>
      <w:ind w:firstLine="0"/>
      <w:jc w:val="left"/>
    </w:pPr>
    <w:r>
      <w:br w:type="page"/>
    </w:r>
  </w:p>
  """
