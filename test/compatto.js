import { readFileSync } from 'fs'

import test from 'ava'

import { dictionary } from '../dictionary.js'
import { compatto, DecompressError } from '../index.js'

const { compress, decompress } = compatto({ dictionary })

const words = readFileSync('/usr/share/dict/words', 'utf-8')

test('`compress()` basic functionality', (t) => {
	const buffer = compress('this is a string')

	t.deepEqual(buffer, Uint8Array.of(...[155, 56, 172, 62, 195, 70]))
})

test('`compress()` should work with unicode characters', (t) => {
	const buffer = compress('this is a string 👍🏼')

	t.deepEqual(
		buffer,
		Uint8Array.of(
			...[
				155,
				56,
				172,
				62,
				195,
				70,
				0,
				255,
				7,
				240,
				159,
				145,
				141,
				240,
				159,
				143,
				188
			]
		)
	)
})

test('`compress()` should work with large inputs', (t) => {
	t.notThrows(() => {
		compress(words)
	})
})

test('`compress()` should flush the verbatim buffer when it gets to 256 elements', (t) => {
	const compressed = compress('='.repeat(260))

	t.is(compressed[0], 255)
	t.is(compressed[1], 255)
	t.is(compressed[258], 255)
})

test('`compress()` cannot use an argument that is not a string', (t) => {
	t.throws(() => {
		compress(['hello'])
	})
})

test('`decompress()` basic functionality', (t) => {
	const string = decompress(Uint8Array.of(...[155, 56, 172, 62, 195, 70]))

	t.is(string, 'this is a string')
})

test('`decompress()` should work with unicode characters', (t) => {
	const string = 'this is a string 🙌🏼, but does it work? 🕵🏼‍♂️'
	const compressed = compress(string)
	const decompressed = decompress(compressed)

	t.is(decompressed, string)
})

test('`decompress()` should work with extra-long incompressible strings', (t) => {
	let string = `${'='.repeat(254)}📮`
	let compressed = compress(string)
	let decompressed = decompress(compressed)

	t.is(compressed.length, 262)
	t.is(decompressed, string)

	string = `${'='.repeat(253)}📮`
	compressed = compress(string)
	decompressed = decompress(compressed)

	t.is(compressed.length, 260)
	t.is(decompressed, string)
})

test('`decompress()` should work with large buffers', (t) => {
	t.notThrows(() => {
		const compressed = compress(words)

		decompress(compressed)
	})
})

test('`decompress()` cannot use buffer that is not instance of `Uint8Array`', (t) => {
	t.throws(
		() => {
			decompress([155, 56, 172, 62, 195, 70])
		},
		{
			instanceOf: TypeError,
			message:
				'The `buffer` argument must be an instance of ’Uint8Array’. It is an instance of `Array`.'
		}
	)

	t.throws(
		() => {
			decompress(null)
		},
		{
			instanceOf: TypeError,
			message:
				'The `buffer` argument must be an instance of ’Uint8Array’. It is `null`.'
		}
	)

	t.throws(
		() => {
			decompress()
		},
		{
			instanceOf: TypeError,
			message:
				'The `buffer` argument must be an instance of ’Uint8Array’. It is `undefined`.'
		}
	)
})

test('`decompress()` cannot use malformed buffer', (t) => {
	t.throws(
		() => {
			decompress(Uint8Array.of(...[254]))
		},
		{
			instanceOf: DecompressError,
			message:
				'The `bytes` argument is malformed because it has 1 elements. It wants to read at index 1.'
		}
	)

	t.throws(
		() => {
			decompress(Uint8Array.of(...[255]))
		},
		{
			instanceOf: DecompressError,
			message:
				'The `bytes` argument is malformed because it has 1 elements. It wants to read at index 1.'
		}
	)

	t.throws(
		() => {
			decompress(Uint8Array.of(...[255, 50, 160]))
		},
		{
			instanceOf: DecompressError,
			message:
				'The `bytes` argument is malformed because it has 3 elements. It wants to read from index 2 to 53.'
		}
	)

	t.throws(
		() => {
			decompress(
				Uint8Array.of(
					...[
						255,
						255,
						'61 '.repeat(256).split(' ').filter(Boolean),
						254
					].flat()
				)
			)
		},
		{
			instanceOf: DecompressError,
			message:
				'The `bytes` argument is malformed because it has 259 elements. It wants to read at index 259.'
		}
	)
})

test('Verify `compress()`’s output with `decompress()`', (t) => {
	const decompressedWords = decompress(compress(words))

	t.deepEqual(decompressedWords, words)

	const compressedWords = words.split('\n').map((word) => compress(word))

	t.deepEqual(compressedWords.map((word) => decompress(word)).join('\n'), words)
})

test('`compatto()` should create a new `compatto` object', (t) => {
	const compattoCopy = compatto({ dictionary })

	const compattoKeys = ['compress', 'decompress']
	const compattoCopyKeys = Object.keys(compattoCopy)

	t.deepEqual(compattoCopyKeys, compattoKeys)
})

test('`compatto()` should create a working new `compatto` object', (t) => {
	const compattoCopy = compatto({ dictionary })

	const string = 'this is a basic string 📮'
	const compressed = compress(string)
	const decompressed = decompress(compressed)

	t.deepEqual(compattoCopy.compress(string), compressed)
	t.is(compattoCopy.decompress(compressed), decompressed)
})

test('`compatto()` should use a new dictionary', (t) => {
	const compattoCopy = compatto({ dictionary: ['aa '] })

	const compressed = compattoCopy.compress('aa b')

	t.deepEqual(compressed, Uint8Array.of(...[0, 254, 98]))
})

test('`compatto()` cannot use malformed dictionary', (t) => {
	t.throws(
		() => {
			compatto({ dictionary: Array.from({ length: 300 }) })
		},
		{
			instanceOf: TypeError,
			message:
				'The `dictionary` option must be an array with at most 254 elements. It has 300 elements.'
		}
	)
	t.throws(
		() => {
			compatto({ dictionary: null })
		},
		{
			instanceOf: TypeError,
			message:
				'The `dictionary` option must be an array with at most 254 elements. It is `null`.'
		}
	)
	t.throws(
		() => {
			compatto({
				dictionary: 'hello'
			})
		},
		{
			instanceOf: TypeError,
			message:
				'The `dictionary` option must be an array with at most 254 elements. It is `String`.'
		}
	)
})
