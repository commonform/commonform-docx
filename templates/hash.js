const paragraph = require('./paragraph')

module.exports = (string, options) => {
  return paragraph({
    title: true,
    alignment: options.leftAlignTitle ? 'left' : 'center',
    content: [{ monospaced: string }]
  }, options)
}
