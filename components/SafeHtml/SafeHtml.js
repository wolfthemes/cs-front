import { FilterXSS, getDefaultWhiteList } from 'xss';

// xss is CommonJS with CJS-only deps: Vercel's runtime cannot require() ESM-only
// packages (jsdom, sanitize-html's htmlparser2 both crashed every page). Unknown tags
// are dropped, script/style bodies removed, inline styles and event handlers never
// allowed; classes are kept so WordPress markup still styles.
const whiteList = Object.fromEntries(
	Object.entries(getDefaultWhiteList()).map(([tag, attrs]) => [tag, [...attrs, 'class']])
);

const filter = new FilterXSS({
	whiteList,
	stripIgnoreTag: true,
	stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
});

export default function SafeHtml({ as: Tag = 'div', html = '', ...props }) {
	return <Tag {...props} dangerouslySetInnerHTML={{ __html: filter.process(html) }} />;
}
