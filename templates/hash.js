import paragraph from './paragraph.js'

export default (string, options) => {
  return paragraph({
    title: true,
    alignment: options.leftAlignTitle ? 'left' : 'center',
    content: [{ monospaced: string }]
  }, options)
}
