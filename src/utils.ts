export function toTitleCase(s: string) {
	return s.replace(
		/([^\s:\-])([^\s:\-]*)/g,
		(_, first: string, more: string) => first.toLocaleUpperCase() + more.toLocaleLowerCase(),
	)
}
