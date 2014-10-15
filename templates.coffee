{surroundedBySpace, isArray, isFunction, isString} = require './util'

module.exports = templates = {}

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

xmlescape = templates.xmlescape = (string) ->
  for escaped, re of XML_SPECIAL_CHARS
    string = string.replace(re, escaped)
  string

templates.preserve = 'xml:space="preserve"'

templates.text = (t, style) ->
  t = xmlescape(t)
  space = surroundedBySpace(t)

  if style
    """
    <w:r>
      <w:rPr>
        <w:rStyle w:val="#{style}"/>
      </w:rPr>
      <w:t#{if space then ' ' + templates.preserve else ''}>#{t}</w:t>
    </w:r>
    """
  else
    """
    <w:r>
      <w:t#{if space then ' ' + templates.preserve else ''}>#{t}</w:t>
    </w:r>
    """

templates.content = (input) ->
  if isArray(input)
    (templates.content c for c in input).join('')
  else
    if isString(input)
      templates.text(input, null)
    else if input.hasOwnProperty('reference')
      templates.reference(input.reference, input.text)
    else
      templates.text(input.text, input.style)

templates.paragraphStyle = (style) ->
  """
  <w:pPr>
    <w:pStyle w:val="#{style}"/>
  </w:pPr>
  """

templates.paragraph = (c, style) ->
  """
  <w:p>
    #{templates.paragraphStyle(style) if style}
    #{templates.content(c)}
  </w:p>
  """

templates.vanish =
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
    #{templates.text(text)}
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
    #{templates.paragraphStyle style if style}
    #{templates.vanish}
    #{templates.bookmark headingContent, -> templates.content headingContent}
  </w:p>
  <w:p>
    #{(templates.content bodyContent).join('')}
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

templates.document = (title, paragraphs) ->
  """
  <w:document #{DOCUMENT_XMLNS}>
    <w:body>
      #{templates.paragraph [title], 'Title'}
    </w:body>
  </w:document>
  """

templates.tab = "<w:r><w:tab/></w:r>"

templates.lineBreak = "<w:r><w:br/></w:r>"

templates.entitySignatureBlock = (entity, name, title) ->
  """
    <w:p>
      #{paragraphStyle 'SignatureBlockEntity'}
    </w:p>
    <w:p>
      #{paragraphStyle 'SignatureBlock'}
      #{templates.text('By: ')}
      #{tab}
      #{lineBreak}
      #{templates.text('Name: ')}
      #{if name then text name else tab}
      #{lineBreak}
      #{templates.text('Title: ')}
      #{if title then text title else tab}
    </w:p>
  """

templates.individualSignatureBlock = (name) ->
  """
    <w:p>
      #{paragraphStyle 'SignatureBlock'}
      #{tab}
      #{lineBreak}
      #{templates.text(name)}
    </w:p>
  """

templates.pageBreak =
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
