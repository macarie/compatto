import test from 'ava'

import { compatto, DecompressError } from '.'

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
			compatto.decompress(Uint8Array.of(...[255, 50, 160]))
		},
		{
			instanceOf: DecompressError,
			message:
				'The `buffer` argument is malformed because it has 3 elements, but wants to read from index 1 to 53'
		}
	)
})
