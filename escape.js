module.exports = function escape (string) {
  const special = {
    '&amp;': /&/g,
    '&apos;': /'/g,
    '&gt;': />/g,
    '&lt;': /</g,
    '&quot;': /"/g
  }
  return Object.keys(special).reduce(function (string, escaped) {
    return string.replace(special[escaped], escaped)
  }, string)
}
