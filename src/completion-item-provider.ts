import * as vscode from 'vscode'

abstract class Completer {
    abstract reg: RegExp
    abstract do_complete(...parts: string[]): vscode.CompletionItem[]
    complete(line: string): vscode.CompletionItem[] {
        const parts = this.reg.exec(line)
        if (!parts) return []
        return this.do_complete(...parts)
    }
}

class CitationCompleter extends Completer {
    reg = /\\\p{L}*cite\p{L}*(?:\[[^\[\]]*\])*\[([^\]]*)$/u
    do_complete(prefix: string): vscode.CompletionItem[] {
        return []
    }
}
class ReferenceCompleter extends Completer {
    reg = /\\(?:in|at)(?:\{\p{L}*\}|\p{L}+)\[([^\]]*))$/u
    /* supports
    1. \in{chapter}[foo
    2. \at{page}[foo
    3. \insec[sec:some section]
       (after \definereferenceformat[insec][text=section])
    */
    do_complete(prefix?: string): vscode.CompletionItem[] {
        return []
    }
}
class CommandCompleter extends Completer {
    reg = /\\(\p{L}*)$/u
    do_complete(prefix: string): vscode.CompletionItem[] {
        return []
    }
}

export class CompletionItemProvider implements vscode.CompletionItemProvider {
    static completers = [
        new CitationCompleter,
        new ReferenceCompleter,
        new CommandCompleter,
    ]
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
    ): Promise<vscode.CompletionItem[] | vscode.CompletionList | undefined> {
        const current_line = document.lineAt(position.line).text
        const current_char = current_line[position.character - 1]
        if (position.character > 1 && current_char === '\\' && current_line[position.character - 2] === '\\') {
            return
        }
        for (const completer of CompletionItemProvider.completers) {
            const completions = completer.complete(current_line.substring(0, position.character))
            if (completions.length > 0) {
                return completions
            }
        }
        return
    }
}
