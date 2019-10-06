import * as path from 'path'
import * as Mocha from 'mocha'
import * as glob from 'fast-glob'

export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({ ui: 'tdd' })
	mocha.useColors(true)
	
	const testsRoot = path.resolve(__dirname, '..')

	const files = await glob('**/**.test.js', { cwd: testsRoot })
	files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

	await new Promise((c, r) => mocha.run(failures => {
		if (failures > 0) {
			r(new Error(`${failures} tests failed.`))
		} else c()
	}))
}