import * as vscode from 'vscode'

import {DocSymbolProvider} from './doc-symbol-provider'
import {CompletionItemProvider} from './completion-item-provider'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: 'file', language: 'context'}, new DocSymbolProvider))
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'context'}, new CompletionItemProvider))
}