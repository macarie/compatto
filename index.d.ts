/**
 * The error thrown when the `decompress()` method fails decompressing a buffer.
 *
 * @param {string} message The reason why the `decompress()` method failed.
 */
export class DecompressError extends Error {
	constructor(message: string);
}

/**
 * An object containing the new options used to create a new compatto instance.
 */
interface Options {
	/**
	 * The dictionary used to compress strings and decompress buffers.
	 *
	 * @default [
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
		]
	 */
	dictionary?: Array<string>;
}

export declare const compatto: {
	/**
	 * Compress a string and returns the result as a new `Uint8Array` instance containing the compressed bytes.
	 *
	 * @param {string} string The string to be compressed.
	 * @returns {Uint8Array} The compressed result as an array of bytes.
	 * @throws `TypeError` if the first parameter is not a string.
	 *
	 * @example
	 *  import { compatto } from 'compatto'
	 *
	 *  compatto.compress('this is a string')
	 *  => Uint8Array [ 155, 56, 172, 62, 195, 70 ]
	 */
	compress(string: string): Uint8Array;
	/**
	 * Decompress the return value of the `compress()` method back to a human-readable string.
	 *
	 * @param {Uint8Array} buffer A correctly-compressed array of bytes.
	 * @returns {string} The decompressed string.
	 * @throws `DecompressError` if the `buffer` parameter is not correct.
	 *
	 * @example
	 *  import { compatto } from 'compatto'
	 *
	 *  compatto.decompress(Uint8Array.of(...[ 155, 56, 172, 62, 195, 70 ]))
	 *  => 'this is a string'
	 */
	decompress(buffer: Uint8Array): string;
	/**
	 * Create a new `compatto` object with some defaults overridden with your own.
	 *
	 * @param {Options} options An object containing the new options.
	 * @returns A new `compatto` object with the new options provided.
	 * @throws `TypeError` if the dictionary is not an array of strings with a maximum length of 254.
	 */
	create(options: Options): typeof compatto;
};
