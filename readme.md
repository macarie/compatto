# [compatto](https://github.com/macarie/compatto) [![Release Version](https://img.shields.io/npm/v/compatto.svg?label=&color=0080FF)](https://www.npmjs.com/package/compatto)

> Compatto is a tiny and fast compression library with unicode support, that works well with small strings too

[![Build Status](https://img.shields.io/travis/com/macarie/compatto)](https://travis-ci.com/macarie/compatto) [![Coverage Status](https://img.shields.io/codecov/c/github/macarie/compatto)](https://codecov.io/gh/macarie/compatto/)

Compatto is based on [antirez](https://github.com/antirez/)'s [smaz](https://github.com/antirez/smaz) concept. It targets modern browsers and Node.js. For older browsers and Node.js versions, you will need to transpile and use a [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder) and [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) polyfill.

## Features

- User-definable dictionary to compress and decompress strings
- Supports Unicode characters, like emojis 🎉
- It is _very_ fast

## Install

```console
$ npm install compatto
```

Or if you prefer using Yarn:

```console
$ yarn add compatto
```

## Usage

```javascript
import { dictionary } from "compatto/dictionary"
import { compatto, DecompressError } from "compatto"

const { compress, decompress } = compatto(dictionary)

const compressedString = compress("this is a string")
// =>  Uint8Array [ 155, 56, 172, 62, 195, 70 ]

const decompressedString = decompress(compressedString)
// => 'this is a string'
```

## API

### compatto(options)

Create a new object, that implements the `Compatto` interface, using the options you provide.

#### options

Type: `object`

##### dictionary

Type: `string[]`

A dictionary used while compressing and decompressing strings, if it has a length greater than `254` a `TypeError` will be thrown.

_Please note that, as of `v2.0`, this option is not provided by default, the user has to explicitly pass it._

### Compatto.compress()

Compress a string into an array of bytes, returned as an instance of `Uint8Array`.

#### string

Type: `string`

A string to compress.

Throws a `TypeError` if the argument is not the correct type.

### Compatto.decompress(bytes)

Decompress an instance of `Uint8Array` to the original, uncompressed, string.

Throws a `DecompressError` if the buffer is not correctly encoded.

#### bytes

Type: `Uint8Array`

An array of bytes representing a compressed string.

Throws a `TypeError` if the argument is not the correct type.

Notes:

- If the compression and decompression dictionaries don't match the result will likely **not** be a human-readable string.

## Browser support

The latest version of Chrome, Firefox, Safari, and Edge.

## Node.js support

Compatto requires Node.js 11 or later.
