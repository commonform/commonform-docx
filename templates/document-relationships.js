const escape = require('../escape')

module.exports = array => {
  const scaffolded = require('../data/scaffold.json').word._rels['document.xml.rels']
  if (array.length === 0) return scaffolded
  const appended = []
  for (let index = 0; index < array.length; index++) {
    const assignment = array[index]
    appended.push(`<Relationship Id="${assignment.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escape(assignment.url)}" TargetMode="External"/>`)
  }
  return scaffolded.replace(
    '</Relationships>',
    `${appended.join('')}</Relationships>`
  )
}
