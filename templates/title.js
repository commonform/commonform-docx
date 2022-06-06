const paragraph = require('./paragraph')

module.exports = (string, options) => {
  const argument = {
    title: true,
    alignment: 'center',
    content: [{ title: string }]
  }
  if (options.leftAlignTitle) argument.alignment = 'left'
  return paragraph(argument, options)
}
