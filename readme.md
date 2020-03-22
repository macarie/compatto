# 📮 [compatto](https://github.com/macarie/compatto) [![Release Version](https://img.shields.io/npm/v/compatto.svg?label=&color=0080FF)](https://www.npmjs.com/package/compatto)

> Compatto is a tiny and fast compression library with Unicode support, that works well with small strings too

[![Build Status](https://img.shields.io/travis/com/macarie/compatto)](https://travis-ci.com/macarie/compatto) [![Coverage Status](https://img.shields.io/codecov/c/github/macarie/compatto)](https://codecov.io/gh/macarie/compatto/)
[![License](https://img.shields.io/npm/l/compatto?color=42cdad)](https://github.com/macarie/compatto/blob/master/license)

Compatto is based on [antirez](https://github.com/antirez/)'s [smaz](https://github.com/antirez/smaz) concept. It targets modern browsers and Node.js. For older browsers and Node.js versions, you will need to transpile and use a [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder) and [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) polyfill.

## Features

- ⏱ [Very fast](#performance) to compress, even faster to decompress
- 🍯 Support for Unicode characters, like emojis
- 🗄 User-definable dictionary

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

const { compress, decompress } = compatto({ dictionary })

const compressedString = compress("this is a string")
// =>  Uint8Array [ 155, 56, 172, 62, 195, 70 ]

const decompressedString = decompress(compressedString)
// => 'this is a string'
```

## API

### compatto(options)

Create a new object that implements the [`Compatto`](#compatto) interface, using the options you provide.

#### options

Type: `object`

##### dictionary

Type: `string[]`

A dictionary used to compress and decompress strings. If its length is greater than `254` a `TypeError` will be thrown.

_Please note that, as of `v2.0`, this option has no default value, the user has to explicitly pass it._

### Compatto

Compatto is an interface that has two methods: [`compress()`](#compressstring) and [`decompress()`](#decompressbytes).

The returned value of [`compatto()`](#compattooptions) implements this interface.

#### compress(string)

Compress a string into an array of bytes, returned as an instance of `Uint8Array`.

Throws a `TypeError` if the argument is not the correct type.

##### string

Type: `string`

A string to compress.

#### decompress(bytes)

Decompress an instance of `Uint8Array` to the original, uncompressed, string.

Throws a `TypeError` if the argument is not the correct type.

Throws a `DecompressError` if the buffer is not correctly encoded. It can be imported along with `compatto()` if you want to check if the error thrown is an instance of this class.

##### bytes

Type: `Uint8Array`

An array of bytes representing a compressed string.

_Please note that if the dictionary used to compress a string is not the same used to decompress the generated buffer, the result of the decompression will most likely **not** be correct._

### dictionary

Type: `string[]`

This is compatto's standard dictionary. Remember that even if it is the _standard_ one, it must be explicitly set by the user!

## Performance

Since `v2.0`, compatto generates a trie from the dictionary that is used to compress every string. Before `v2.0`, compatto tried to get a substring as long as the longest word in the dictionary and see if that substring was in it. If it wasn't, it tried again with a substring that was one character shorter, and so on until the substring was one character.

For compressible strings it was not _that_ slow, but if a word had characters that were not inside the dictionary that approach was _really_ slow!

This implementation change gave compatto a big performance boost 🚌💨

In `v2.1` the `compress()` algorithm was simplified, thus leading to a performance improvement of about 20% compared to `v2.0` 🐌

To compress every word in `/usr/share/dict/words`, 235,887 words, `v1.0` took `~500ms`, `v2.0` took `~370ms`, but `v2.1` takes only `~295ms`!

What about compressing the whole file, that is around 2.5MB, just as a long piece of text? Well, the results are even better: `v1.0` took `~700ms`, `v2.0` took `~465ms`, and `v2.1` takes only `~365ms`. This is almost a 50% improvement!

Is there space for improvements? **Absolutely**! I guess that the compression algorithm can be further improved, and keep in mind that I didn't have time to do code profiling.

## Browser support

The latest version of Chrome, Firefox, Safari, and Edge.

## Node.js support

Compatto requires Node.js 11 or later.

## Related

- [hex-my-bytes](https://github.com/macarie/hex-my-bytes) - Display bytes sequences as strings of hexadecimal digits.
