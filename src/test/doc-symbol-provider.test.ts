import * as assert from 'assert'
import * as vscode from 'vscode'

import { DocSymbolProvider } from '../doc-symbol-provider'

suite('Doc symbol provider tests', () => {
	vscode.window.showInformationMessage('Start all tests.')

	test('Complex example', async () => {
        const content = `
        \\startpart[title=Part1]
        \\startsubsection[bookmark=subsec, title={Subsection before section}]
        \\stopsubsection
        \\startsection[title={Section}, bookmark=sec]
        \\stopsection
        \\stoppart
        
        \\startpart  % no title
        \\stoppart
        `
        const doc = await vscode.workspace.openTextDocument({ language: 'context', content })
        const symbols = new DocSymbolProvider().provideDocumentSymbols(doc)
		assert.equal(symbols.length, 2)
		assert.equal(symbols[0].name, 'Part1')
        assert.equal(symbols[1].name, 'Part 2') // automatic name
	})
})
