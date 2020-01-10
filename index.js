/*! MIT License © Raul Macarie */

/* eslint no-labels: [ "error", { "allowLoop": true } ] */

class DecompressError extends Error {
	constructor(message) {
		super(message)

		this.name = 'DecompressError'
	}
}

class Compatto {
	constructor(customOptions) {
		this.options = {
			// prettier-ignore
			dictionary: [
				' ', 'the', 'e', 't', 'a', 'of', 'o', 'and', 'i', 'n', 's', 'e ', 'r',
				' th', ' t', 'in', 'he', 'th', 'h', 'he ', 'to', '\r\n', 'l', 's ',
				'd', ' a', 'an', 'er', 'c', ' o', 'd ', 'on', ' of', 're', 'of ', 't ',
				', ', 'is', 'u', 'at', '   ', 'n ', 'or', 'which', 'f', 'm', 'as',
				'it', 'that', '\n', 'was', 'en', '  ', ' w', 'es', ' an', ' i', '\r',
				'f ', 'g', 'p', 'nd', ' s', 'nd ', 'ed ', 'w', 'ed', 'http://', 'for',
				'te', 'ing', 'y ', 'The', ' c', 'ti', 'r ', 'his', 'st', ' in', 'ar',
				'nt', ',', ' to', 'y', 'ng', ' h', 'with', 'le', 'al', 'to ', 'b',
				'ou', 'be', 'were', ' b', 'se', 'o ', 'ent', 'ha', 'ng ', 'their', '"',
				'hi', 'from', ' f', 'in ', 'de', 'ion', 'me', 'v', '.', 've', 'all',
				're ', 'ri', 'ro', 'is ', 'co', 'f t', 'are', 'ea', '. ', 'her', ' m',
				'er ', ' p', 'es ', 'by', 'they', 'di', 'ra', 'ic', 'not', 's, ',
				'd t', 'at ', 'ce', 'la', 'h ', 'ne', 'as ', 'tio', 'on ', 'n t', 'io',
				'we', ' a ', 'om', ', a', 's o', 'ur', 'li', 'll', 'ch', 'had', 'this',
				'e t', 'g ', 'e\r\n', ' wh', 'ere', ' co', 'e o', 'a ', 'us', ' d',
				'ss', '\n\r\n', '\r\n\r', '="', ' be', ' e', 's a', 'ma', 'one', 't t',
				'or ', 'but', 'el', 'so', 'l ', 'e s', 's,', 'no', 'ter', ' wa', 'iv',
				'ho', 'e a', ' r', 'hat', 's t', 'ns', 'ch ', 'wh', 'tr', 'ut', '/',
				'have', 'ly ', 'ta', ' ha', ' on', 'tha', '-', ' l', 'ati', 'en ',
				'pe', ' re', 'there', 'ass', 'si', ' fo', 'wa', 'ec', 'our', 'who',
				'its', 'z', 'fo', 'rs', '>', 'ot', 'un', '<', 'im', 'th ', 'nc', 'ate',
				'><', 'ver', 'ad', ' we', 'ly', 'ee', ' n', 'id', ' cl', 'ac', 'il',
				'</', 'rt', ' wi', 'div', 'e, ', ' it', 'whi', ' ma', 'ge', 'x', 'e c',
				'men', '.com'
			],

			...customOptions,

			get dictionaryIndex() {
				delete this.dictionaryIndex

				const map = new Map()

				for (let index = this.dictionary.length; index > 0; index--) {
					map.set(this.dictionary[index], index)
				}

				this.dictionaryIndex = map

				return map
			},
			get longestDictionaryWordLength() {
				delete this.longestDictionaryWordLength

				const longestDictionaryWordLength = Math.max(
					...this.dictionary.map(element => element.length)
				)

				this.longestDictionaryWordLength = longestDictionaryWordLength

				return longestDictionaryWordLength
			}
		}

		const { dictionary } = this.options

		if (!Array.isArray(dictionary) || dictionary.length > 254) {
			if (Array.isArray(dictionary)) {
				throw new TypeError(
					`The \`dictionary\` option must be an array of at most 254 elements, but it has ${dictionary.length}`
				)
			}

			if (dictionary === null) {
				throw new TypeError(
					"The `dictionary` option must be an instance of 'Array', but it is 'null'"
				)
			}

			throw new TypeError(
				`The \`dictionary\` option must be an instance of 'Array', but it is an instance of '${dictionary.constructor.name}'`
			)
		}

		this.verbatim = []
		this.textEncoder = new TextEncoder()
		this.textDecoder = new TextDecoder()

		this.compress = this.compress.bind(this)
		this.decompress = this.decompress.bind(this)
	}

	createVerbatimFlusher() {
		const { push } = Array.prototype

		const { verbatim } = this

		const chunk = []

		return () => {
			const verbatimLength = verbatim.length

			chunk.length = 0

			if (verbatimLength > 1) {
				chunk.push(255)
				chunk.push(verbatimLength - 1)
			} else {
				chunk.push(254)
			}

			push.apply(chunk, verbatim)

			verbatim.length = 0

			return chunk
		}
	}

	compress(string) {
		if (typeof string !== 'string') {
			throw new TypeError(
				`The \`string\` argument must be of type 'string', but it is of type '${typeof string}'`
			)
		}

		const { push } = Array.prototype

		const { options, textEncoder, verbatim } = this

		const { dictionaryIndex, longestDictionaryWordLength } = options

		const flushVerbatim = this.createVerbatimFlusher()

		const output = []

		// The iterator is used to correctly handle unicode characters
		const stringIterator = string[Symbol.iterator]()
		const stringLength = string.length

		let index = 0

		compressLoop: while (index < stringLength) {
			// Set the maximum string length to look up for in the dictionary
			let maximumWordLength = longestDictionaryWordLength

			if (stringLength - index < maximumWordLength) {
				maximumWordLength = stringLength - index
			}

			// Try to look up for a word inside the dictionary
			for (
				let chunkLength = maximumWordLength;
				chunkLength > 0;
				chunkLength--
			) {
				const chunkCode = dictionaryIndex.get(
					string.slice(index, index + chunkLength)
				)

				if (chunkCode) {
					if (verbatim.length > 0) {
						push.apply(output, flushVerbatim())
					}

					output.push(chunkCode)

					index += chunkLength

					// Every character in the dictionary is one byte, so the iterator
					//  should skip `chunkLength` characters from the string
					for (let skip = chunkLength; skip > 0; skip--) stringIterator.next()

					continue compressLoop
				}
			}

			// There were no matches inside the dictionary, so get the next real
			//  unicode character from the string and encode it
			// This is necessary because string[i] doesn't work well with unicode
			//  characters, like emojis ☹️
			const character = stringIterator.next().value
			const encodedCharacter = textEncoder.encode(character)

			if (verbatim.length + encodedCharacter.length > 256) {
				push.apply(output, flushVerbatim())
			}

			push.apply(verbatim, encodedCharacter)

			if (verbatim.length === 256) {
				push.apply(output, flushVerbatim())
			}

			// The encoded character might have been longer than one byte, so add
			//  its, as stated above, buggy length to the index
			index += character.length
		}

		if (verbatim.length > 0) {
			push.apply(output, flushVerbatim())
		}

		// Using `Uint8Array.of(...output)` may lead to reach the maximum call
		//  stack size, so...
		try {
			// eslint-disable-next-line prefer-spread
			return Uint8Array.of.apply(Uint8Array, output)
		} catch (_) {
			return new Uint8Array(output)
		}
	}

	decompress(buffer) {
		if (buffer.constructor.name !== 'Uint8Array') {
			throw new TypeError(
				`The \`buffer\` argument must be an instance of 'Uint8Array', but it is an instance of '${buffer.constructor.name}'`
			)
		}

		const { push } = Array.prototype

		const { options, textDecoder } = this

		const { dictionary } = options

		let output = ''

		const bufferLength = buffer.length

		let index = 0

		while (index < bufferLength) {
			const chunk = buffer[index]

			if (chunk === 254) {
				index += 1

				if (index >= bufferLength) {
					throw new DecompressError(
						`The \`buffer\` argument is malformed because it has ${bufferLength} elements, but wants to read at index ${index}`
					)
				}

				output += textDecoder.decode(buffer.slice(index, index + 1))

				index += 1

				continue
			}

			if (chunk === 255) {
				let verbatimStart
				let verbatimEnd

				const chunkToDecode = []

				// To correctly decompress unicode characters all bytes have to be
				//  decoded at once
				do {
					index += 1

					if (index >= bufferLength) {
						throw new DecompressError(
							`The \`buffer\` argument is malformed because it has ${bufferLength} elements, but wants to read at index ${index}`
						)
					}

					verbatimStart = index + 1
					verbatimEnd = index + buffer[index] + 2

					if (verbatimEnd > bufferLength) {
						throw new DecompressError(
							`The \`buffer\` argument is malformed because it has ${bufferLength} elements, but wants to read from index ${index} to ${verbatimEnd}`
						)
					}

					push.apply(chunkToDecode, buffer.slice(verbatimStart, verbatimEnd))

					index = verbatimEnd
				} while (buffer[index] === 255)

				output += textDecoder.decode(Uint8Array.of(...chunkToDecode))

				continue
			}

			output += dictionary[chunk]

			index += 1
		}

		return output
	}
}

const isObject = source => source !== null && typeof source === 'object'

const validateAndMerge = (...sources) => {
	for (const source of sources) {
		if (
			(!isObject(source) || Array.isArray(source)) &&
			typeof source !== 'undefined'
		) {
			if (source === null) {
				throw new TypeError(
					"The `options` argument must be an 'object', but it is 'null'"
				)
			}

			throw new TypeError(
				`The \`options\` argument must be an 'object', but it is an instance of '${source.constructor.name}'`
			)
		}
	}

	return Object.assign({}, ...sources)
}

const exportableMethods = ['compress', 'decompress']

const createInstance = defaultOptions => {
	const compattoInstance = new Compatto(validateAndMerge(defaultOptions))

	const compatto = {}

	for (const method of exportableMethods) {
		compatto[method] = compattoInstance[method]
	}

	compatto.create = options =>
		createInstance(validateAndMerge(defaultOptions, options))

	return compatto
}

const compatto = createInstance(undefined)

export { DecompressError, compatto }
