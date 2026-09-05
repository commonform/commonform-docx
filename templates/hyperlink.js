import escape from '../escape.js'

export default (options, url) => {
  const rId = options.rIdForHREF(url)
  return `<w:hyperlink r:id="${rId}"><w:r><w:rPr><w:color w:val="0000EE"/><w:u w:val="single"/></w:rPr><w:t>${escape(url)}</w:t></w:r></w:hyperlink>`
}
