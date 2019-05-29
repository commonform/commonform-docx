# commonform-docx

render [Common Form objects](https://www.npmjs.com/package/commonform-validate) in Office Open XML (Microsoft Word `.docx` format)

The exported function takes three arguments:

1. a Common Form

2. an Array of fill-in-the-blank values

3. an options Object

The options object must contain:

1. a `numbering` property whose value is an [abstract numbering](https://npmjs.com/packages/abstract-numbering)

It may contain:

1. a `title` property whose value is a string

2. an `edition` property whose value is a string

3. a `hash` property whose value is `true` or `false`

4. a `markFilled` property whose value is `true` or `false`

The function returns a [JSZip](https://npmjs.com/packages/jszip) Object primed with `.docx` document data.
