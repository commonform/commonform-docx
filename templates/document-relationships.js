import escape from '../escape.js'
import scaffold from '../data/scaffold.json' with { type: 'json' }

export default array => {
  const scaffolded = scaffold.word._rels['document.xml.rels']
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
