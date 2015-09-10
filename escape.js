var smarten = require('smart-quotes')

var special = {
  '&amp;': /&/g,
  '&apos;': /'/g,
  '&gt;': />/g,
  '&lt;': /</g,
  '&quot;': /"/g }

function escape(string) {
  return Object.keys(special)
    .reduce(
      function(string, escaped) {
        return string.replace(special[escaped], escaped) },
      smarten(string.replace(/^'s/, '’s'))) }

module.exports = escape
