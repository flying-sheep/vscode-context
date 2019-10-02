import * as vscode from 'vscode'

import {DocSymbolProvider} from './doc-symbol-provider'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: 'file', language: 'context'}, new DocSymbolProvider))
}