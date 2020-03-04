/**
 * The error thrown when `decompress()` fails decompressing a buffer.
 *
 * @param {string} message The reason why `decompress()` failed.
 */
export class DecompressError extends Error {
	constructor(message: string)
}

/**
 * An object containing the new options used to create a new compatto instance.
 */
interface Options {
	/**
	 * The dictionary used to compress strings and decompress compressed strings.
	 * The maximum length it might have is 254.
	 */
	dictionary: string[]
}

export interface Compatto {
	/**
	 * Compress a string and get the result as a new `Uint8Array` instance.
	 *
	 * @param {string} string The string to compress.
	 * @returns {Uint8Array} The compressed result as an array of bytes.
	 * @throws `TypeError` if the first parameter is not a string.
	 *
	 * @example
	 *  import { dictionary } from 'compatto/dictionary'
	 *  import { compatto } from 'compatto'
	 *
	 *  const { compress } = compatto({ dictionary })
	 *
	 *  compress('this is a string')
	 *  => Uint8Array [ 155, 56, 172, 62, 195, 70 ]
	 */
	compress(string: string): Uint8Array

	/**
	 * Decompress the return value `compress()` back to a human-readable string.
	 *
	 * @param {Uint8Array} bytes A correctly-compressed array of bytes.
	 * @returns {string} The decompressed string.
	 * @throws `DecompressError` if the `bytes` parameter is not correct.
	 *
	 * @example
	 *  import { dictionary } from 'compatto/dictionary'
	 *  import { compatto } from 'compatto'
	 *
	 *  const { decompress } = compatto({ dictionary })
	 *
	 *  decompress(Uint8Array.of(...[ 155, 56, 172, 62, 195, 70 ]))
	 *  => 'this is a string'
	 */
	decompress(bytes: Uint8Array): string
}

/**
 * Create a new object, that implements the `Compatto` interface, with some defaults overridden with your own.
 *
 * @param {Options} options An object containing the new options.
 * @returns The newly created object that uses the provided options.
 * @throws `TypeError` if the dictionary is not an array of strings with a maximum length of 254.
 *
 * @example
 *  import { dictionary } from 'compatto/dictionary'
 *  import { compatto } from 'compatto'
 *
 *  const { compress, decompress } = compatto({ dictionary })
 */
export const compatto: (options: Options) => Compatto
