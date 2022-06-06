module.exports = string => {
  const special = {
    '&amp;': /&/g,
    '&apos;': /'/g,
    '&gt;': />/g,
    '&lt;': /</g,
    '&quot;': /"/g
  }
  return Object.keys(special).reduce((string, escaped) => string.replace(special[escaped], escaped), string)
}
