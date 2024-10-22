const { push } = Array.prototype
const { min } = Math

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export class DecompressError extends Error {
	constructor(message) {
		super(message)

		this.name = 'DecompressError'
	}
}

const createMessage = (...messages) => {
	return messages.join(' ')
}

const createTrie = (strings) => {
	const trieRoot = new Map()

	for (const [index, string] of strings.entries()) {
		let trie = trieRoot

		const characters = string[Symbol.iterator]()

		for (const character of characters) {
			let branch = trie.get(character)

			if (!branch) {
				const newBranch = new Map()

				trie.set(character, newBranch)

				branch = newBranch
			}

			trie = branch
		}

		trie.value = index
	}

	return trieRoot
}

const retrieveWord = (trie, characters, characterAt) => {
	let trieNode = trie
	let index = characterAt

	const retrievedCharacters = []

	do {
		trieNode = trieNode.get(characters[index])

		if (trieNode) {
			retrievedCharacters.push({
				character: characters[index],
				value: trieNode.value,
				index
			})

			index += 1
		}
	} while (trieNode && characters[index])

	let retrievedIndex = retrievedCharacters.length - 1

	while (
		retrievedIndex > 0 &&
		retrievedCharacters[retrievedIndex].value === undefined
	) {
		retrievedIndex -= 1
	}

	return [
		retrievedCharacters[retrievedIndex] &&
			retrievedCharacters[retrievedIndex].value,
		((retrievedCharacters[retrievedIndex] &&
			retrievedCharacters[retrievedIndex].index) ||
			characterAt) + 1
	]
}

const flushVerbatim = (verbatim, bytesToRemove) => {
	const chunk = []

	if (bytesToRemove > 1) {
		chunk.push(255, bytesToRemove - 1)
	} else {
		chunk.push(254)
	}

	push.apply(chunk, verbatim.splice(0, bytesToRemove))

	return chunk
}

const compress = (string, trie) => {
	const characters = [...string]
	const charactersLength = characters.length

	const verbatim = []
	let characterIndex = 0

	const bytes = []

	while (characterIndex < charactersLength) {
		const [byte, nextIndex] = retrieveWord(trie, characters, characterIndex)

		// eslint-disable-next-line no-negated-condition
		if (byte !== undefined) {
			while (verbatim.length > 0) {
				push.apply(bytes, flushVerbatim(verbatim, min(256, verbatim.length)))
			}

			bytes.push(byte)
		} else {
			push.apply(verbatim, textEncoder.encode(characters[characterIndex]))

			while (verbatim.length >= 256) {
				push.apply(bytes, flushVerbatim(verbatim, 256))
			}
		}

		characterIndex = nextIndex
	}

	if (verbatim.length > 0) {
		push.apply(bytes, flushVerbatim(verbatim, verbatim.length))
	}

	try {
		return Uint8Array.of(...bytes)
	} catch {
		return new Uint8Array(bytes)
	}
}

const handleChunk254 = (bytes, index, bytesLength) => {
	const byteIndex = index + 1

	if (byteIndex >= bytesLength) {
		throw new DecompressError(
			createMessage(
				`The \`bytes\` argument is malformed because it has ${bytesLength} elements.`,
				`It wants to read at index ${byteIndex}.`
			)
		)
	}

	return [bytes.slice(byteIndex, byteIndex + 1), byteIndex + 1]
}

const handleChunk255 = (bytes, index, bytesLength) => {
	const bytesCountIndex = index + 1

	if (bytesCountIndex >= bytesLength) {
		throw new DecompressError(
			createMessage(
				`The \`bytes\` argument is malformed because it has ${bytesLength} elements.`,
				`It wants to read at index ${bytesCountIndex}.`
			)
		)
	}

	const verbatimStart = bytesCountIndex + 1
	const verbatimEnd = bytesCountIndex + bytes[bytesCountIndex] + 2

	if (verbatimEnd > bytesLength) {
		throw new DecompressError(
			createMessage(
				`The \`bytes\` argument is malformed because it has ${bytesLength} elements.`,
				`It wants to read from index ${verbatimStart} to ${verbatimEnd}.`
			)
		)
	}

	return [bytes.slice(verbatimStart, verbatimEnd), verbatimEnd]
}

const decompress = (bytes, dictionary) => {
	const bytesLength = bytes.length
	let index = 0

	let string = ''

	while (index < bytesLength) {
		const chunk = bytes[index]

		if (chunk === 254) {
			const [byteToDecode, nextIndex] = handleChunk254(
				bytes,
				index,
				bytesLength
			)

			string += textDecoder.decode(byteToDecode)

			index = nextIndex

			continue
		}

		if (chunk === 255) {
			const chunkToDecode = []

			do {
				const [bytesToDecode, nextIndex] = handleChunk255(
					bytes,
					index,
					bytesLength
				)

				push.apply(chunkToDecode, bytesToDecode)

				index = nextIndex
			} while (bytes[index] === 255)

			if (bytes[index] === 254) {
				const [byteToDecode, nextIndex] = handleChunk254(
					bytes,
					index,
					bytesLength
				)

				chunkToDecode.push(byteToDecode)

				index = nextIndex
			}

			string += textDecoder.decode(Uint8Array.of(...chunkToDecode))

			continue
		}

		string += dictionary[chunk]

		index += 1
	}

	return string
}

export const compatto = ({ dictionary } = {}) => {
	if (!Array.isArray(dictionary) || dictionary.length > 254) {
		throw new TypeError(
			createMessage(
				'The `dictionary` option must be an array with at most 254 elements.',
				Array.isArray(dictionary)
					? `It has ${dictionary.length} elements.`
					: `It is \`${
							dictionary === undefined || dictionary === null
								? dictionary
								: dictionary.constructor.name
					  }\`.`
			)
		)
	}

	const trie = createTrie(dictionary)

	return {
		compress(string) {
			if (typeof string !== 'string') {
				throw new TypeError(
					createMessage(
						'The `string` argument must be of type ’string’.',
						`Its type is \`${typeof string}\`.`
					)
				)
			}

			return compress(string, trie)
		},
		decompress(bytes) {
			if (
				bytes === undefined ||
				bytes === null ||
				bytes.constructor.name !== 'Uint8Array'
			) {
				throw new TypeError(
					createMessage(
						'The `buffer` argument must be an instance of ’Uint8Array’.',
						`It is ${
							bytes === undefined || bytes === null
								? `\`${bytes}\``
								: `an instance of \`${bytes.constructor.name}\``
						}.`
					)
				)
			}

			return decompress(bytes, dictionary)
		}
	}
}
