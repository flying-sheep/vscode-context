import {
	DocumentSymbolProvider,
	TextDocument,
	DocumentSymbol,
	SymbolKind,
	Range,
	Position,
} from 'vscode'

const titles_num = {part: 0, chapter: 1, section: 2, subsection: 3, subsubsection: 4}
const titles_non = {title: 1, subject: 2, subsubject: 3, subsubsubject: 4}
const titles = {...titles_num, ...titles_non}
const title_kinds = Object.keys(titles).join('|')
const re_title_suffix = /\[[^\\]*title=(\{[^}]+\}|[^\w]+)[^\]]*\]/  //TODO: allow backslashes, remove {}
const re_title_start = new RegExp(`^\\s*\\\\start(${title_kinds})${re_title_suffix.source}`)
const re_title_stop = new RegExp(`^\\s*\\\\stop(${title_kinds})`)

export class DocSymbolProvider implements DocumentSymbolProvider {
	public provideDocumentSymbols(document: TextDocument): DocumentSymbol[] {
		return this.sect2syms(parseDocument(document))
	}

	sect2syms(sections: Section[]): DocumentSymbol[] {
		const symbols: DocumentSymbol[] = []
		for (const {label, range, full_range, children} of sections) {
			const symbol = new DocumentSymbol(label, '', SymbolKind.Namespace, full_range, range)
			symbol.children = this.sect2syms(children)
			symbols.push(symbol)
		}
		return symbols
	}
}

type Section = {
	level: number,
	label: string,
	range: Range,
	full_range: Range,
	parent: Section | null,
	children: Section[],
}

function parseDocument(document: TextDocument) {
	const outline: Section[] = []
	let current_section: Section | null = null
	
	let line = document.lineAt(0)
	while (line != null) {
		const match_start = re_title_start.exec(line.text)
		if (match_start != null) {
			const level_name = match_start[1] as (keyof typeof titles)
			const level = titles[level_name]
			const label = match_start[2]
			const parent: Section | null = current_section
			const range = new Range(
				line.lineNumber, match_start.index,
				line.lineNumber, match_start.index + match_start[0].length,
			)
			current_section = {level, label, range, full_range: range, parent, children: []}
			if (parent == null)
				outline.push(current_section)
			else
				parent.children.push(current_section)
			console.log('start', current_section)
		}
		const match_stop = re_title_stop.exec(line.text)
		if (match_stop != null) {
			const level_name = match_stop[1] as (keyof typeof titles)
			const level = titles[level_name]
			// not an if for some resilience in the face of unclosed sections
			while (current_section != null && current_section.level >= level) {
				const end = new Position(line.lineNumber, match_stop.index + match_stop[0].length)
				current_section.full_range = current_section.full_range.with({end})
				current_section = current_section.parent
			}
			console.log('stop', current_section)
		}
		if (line.lineNumber + 1 == document.lineCount) break
		line = document.lineAt(line.lineNumber+1)
	}
	return outline
}
