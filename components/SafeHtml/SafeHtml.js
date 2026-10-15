import sanitizeHtml from 'sanitize-html';

// Pure-JS sanitizer (no jsdom): defaults already drop script/style/iframe/form/object/embed
// and inline style attributes; classes are kept so WordPress markup still styles.
const SANITIZE_OPTIONS = {
	allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['class'] },
};

export default function SafeHtml({ as: Tag = 'div', html = '', ...props }) {
	const sanitizedHtml = sanitizeHtml(html, SANITIZE_OPTIONS);
	return <Tag {...props} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
