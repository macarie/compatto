import test from 'ava'

import { dictionary } from '../dictionary.js'

test('`dictionary` should never change', t => {
	t.snapshot(dictionary)
})
