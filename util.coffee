util = module.exports

util.isArray = Array.isArray || (o) ->
  toString.call(o) == '[object Array]'

util.isFunction = (o) ->
  typeof o == 'function' || false

util.isString = (o) ->
  typeof o == 'string' || false

util.surroundedBySpace = (string) ->
  first = string[0]
  last = string[string.length - 1]
  first == ' ' || last == ' '

util.trim = do ->
  if String.prototype.trim
    (s) -> s.trim()
  else
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
    (s) -> s.replace(rtrim, '')
