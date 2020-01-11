# [compatto](https://github.com/macarie/compatto) [![Release Version](https://img.shields.io/npm/v/compatto.svg?label=&color=0080FF)](https://www.npmjs.com/package/compatto)

> Compatto is a tiny and fast compression library with unicode support, that works well with small strings too

[![Build Status](https://img.shields.io/travis/com/macarie/compatto)](https://travis-ci.com/macarie/compatto) [![Coverage Status](https://img.shields.io/codecov/c/github/macarie/compatto)](https://codecov.io/gh/macarie/compatto/)

Compatto is based on [antirez](https://github.com/antirez/)'s [smaz](https://github.com/antirez/smaz) concept. It targets [modern browsers](#browser-support) and [Node.js](#nodejs-support). For older browsers and Node.js versions, you will need to transpile and use a [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder) and [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) polyfill.


## Features

- User-definable dictionary to compress and decompress strings
- Supports Unicode characters, like emojis 🎉
- It is *very* fast



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
import { compatto, DecompressError } from 'compatto'

const compressedString = compatto.compress('this is a string')
// =>  Uint8Array [ 155, 56, 172, 62, 195, 70 ]

const decompressedString = compatto.decompress(compressedString)
// => 'this is a string'
```


## API

### compatto.compress(string)

Compress a string into an array of bytes, returned as an instance of `Uint8Array`.

#### string

Type: `string`

A string to compress.

Throws a `TypeError` if the argument is not the correct type.

### compatto.decompress(buffer)

Decompress an instance of `Uint8Array` to the original, uncompressed, string.

Throws a `DecompressError` if the buffer is not correctly encoded.

#### buffer

Type: `Uint8Array`

A buffer representing a compressed string.

Throws a `TypeError` if the argument is not the correct type.

Notes:
- If the compression and decompression dictionaries don't match the result will likely **not** be a human-readable string.

### compatto.create(options)

Create a new `compatto` object with some defaults overridden with your own.

#### options

Type: `object`

##### dictionary

Type: `Array<string>`

Dictionary used while compressing and decompressing strings, if it has a length greater than `254` a `TypeError` will be thrown.


## Browser support

The latest version of Chrome, Firefox, Safari, and Edge 76.


## Node.js support

Compatto requires **Node.js 11 or later**, but it indicates Node.js 8 in `package.json` so you can use it with Node.js 8 by polyfilling the globals without having Yarn fail on install.
