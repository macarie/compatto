import { readFileSync } from 'fs'
import test from 'ava'

import { compatto, DecompressError } from '.'

const words = readFileSync('/usr/share/dict/words', 'utf-8')

test('`compatto` should not change its public properties', t => {
	t.snapshot(compatto)
})

test('`compress()` basic functionality', t => {
	const buffer = compatto.compress('this is a string')

	t.deepEqual(Uint8Array.of(...[155, 56, 172, 62, 195, 70]), buffer)
})

test('`compress()` should work with unicode characters', t => {
	const buffer = compatto.compress('this is a string 👍🏼')

	t.deepEqual(
		Uint8Array.of(
			...[
				155,
				56,
				172,
				62,
				195,
				70,
				255,
				8,
				32,
				240,
				159,
				145,
				141,
				240,
				159,
				143,
				188
			]
		),
		buffer
	)
})

test('`compress()` should work with large inputs', t => {
	t.notThrows(() => {
		compatto.compress(words)
	})
})

test('`compress()` should flush the verbatim buffer when it gets to 256 elements', t => {
	const compressed = compatto.compress('='.repeat(260))

	t.is(255, compressed[0])
	t.is(255, compressed[1])
	t.is(255, compressed[258])
})

test('`compress()` cannot use an argument that is not a string', t => {
	t.throws(() => {
		compatto.compress(['hello'])
	})
})

test('`decompress()` basic functionality', t => {
	const string = compatto.decompress(
		Uint8Array.of(...[155, 56, 172, 62, 195, 70])
	)

	t.is('this is a string', string)
})

test('`decompress()` should work with unicode characters', t => {
	const string = 'this is a string 🙌🏼, but does it work? 🕵🏼‍♂️'
	const compressed = compatto.compress(string)
	const decompressed = compatto.decompress(compressed)

	t.is(string, decompressed)
})

test('`decompress()` should work with extra-long uncompressable strings', t => {
	const string =
		'❌️ 😢 🔚 😀 ✨✨✨📚️📚️📚️📚️ ⏳😀⌛️😭🐝🔀🙏👁️👁️➡️🌎❌🎶🎵🎶❌ ⬇️⬇️⬇️⬇️⬇️ ❌🆒❌🆒❌✋🤬⬆️😈☝️⏲️😠 ⬇️⬇️⬇️⬇️⬇️⬇️ ❌6⃣0⃣⏲️😄❌ ⬇️⬇️⬇️⬇️⬇️⬇️ 😢😭😢😭😢😭'
	const compressed = compatto.compress(string)
	const decompressed = compatto.decompress(compressed)

	t.is(341, compressed.length)
	t.is(string, decompressed)
})

test('`decompress()` should work with large buffers', t => {
	t.notThrows(() => {
		const compressed = compatto.compress(words)

		compatto.decompress(compressed)
	})
})

test('`decompress()` cannot use buffer that is not instance of `Uint8Array`', t => {
	t.throws(
		() => {
			compatto.decompress([155, 56, 172, 62, 195, 70])
		},
		{
			instanceOf: TypeError,
			message:
				"The `buffer` argument must be an instance of 'Uint8Array', but it is an instance of 'Array'"
		}
	)
})

test('`decompress()` cannot use malformed buffer', t => {
	t.throws(
		() => {
			compatto.decompress(Uint8Array.of(...[254]))
		},
		{
			instanceOf: DecompressError,
			message:
				'The `buffer` argument is malformed because it has 1 elements, but wants to read at index 1'
		}
	)
	t.throws(
		() => {
			compatto.decompress(Uint8Array.of(...[255]))
		},
		{
			instanceOf: DecompressError,
			message:
				'The `buffer` argument is malformed because it has 1 elements, but wants to read at index 1'
		}
	)
	t.throws(
		() => {
			compatto.decompress(Uint8Array.of(...[255, 50, 160]))
		},
		{
			instanceOf: DecompressError,
			message:
				'The `buffer` argument is malformed because it has 3 elements, but wants to read from index 1 to 53'
		}
	)
})

test('`create()` should create a new `compatto` object', t => {
	const compattoCopy = compatto.create()

	const compattoKeys = Object.keys(compatto)
	const compattoCopyKeys = Object.keys(compattoCopy)

	t.deepEqual(compattoKeys, compattoCopyKeys)
})

test('`create()` should create a working new `compatto` object', t => {
	const compattoCopy = compatto.create()

	const string = 'this is a basic string 📮'
	const compressed = compatto.compress(string)
	const decompressed = compatto.decompress(compressed)

	t.deepEqual(compressed, compattoCopy.compress(string))
	t.is(decompressed, compattoCopy.decompress(compressed))
})

test('`create()` should use a new dictionary', t => {
	const compattoCopy = compatto.create({ dictionary: ['aa '] })

	const compressed = compattoCopy.compress('aa b')

	t.deepEqual(Uint8Array.of(...[0, 254, 98]), compressed)
})

test('`create()` cannot work with options that are not objects', t => {
	t.throws(
		() => {
			compatto.create([])
		},
		{
			instanceOf: TypeError,
			message:
				"The `options` argument must be an 'object', but it is an instance of 'Array'"
		}
	)
	t.throws(
		() => {
			compatto.create('options')
		},
		{
			instanceOf: TypeError,
			message:
				"The `options` argument must be an 'object', but it is an instance of 'String'"
		}
	)
	t.throws(
		() => {
			compatto.create(null)
		},
		{
			instanceOf: TypeError,
			message: "The `options` argument must be an 'object', but it is 'null'"
		}
	)
})

test('`create()` cannot use malformed dictionary', t => {
	t.throws(
		() => {
			compatto.create({ dictionary: new Array(300) })
		},
		{
			instanceOf: TypeError,
			message:
				'The `dictionary` option must be an array of at most 254 elements, but it has 300'
		}
	)
	t.throws(
		() => {
			compatto.create({ dictionary: null })
		},
		{
			instanceOf: TypeError,
			message:
				"The `dictionary` option must be an instance of 'Array', but it is 'null'"
		}
	)
	t.throws(
		() => {
			compatto.create({
				dictionary: 'hello'
			})
		},
		{
			instanceOf: TypeError,
			message:
				"The `dictionary` option must be an instance of 'Array', but it is an instance of 'String'"
		}
	)
})
