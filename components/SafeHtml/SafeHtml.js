import DOMPurify from 'isomorphic-dompurify';

const SANITIZE_OPTIONS = {
	USE_PROFILES: { html: true },
	FORBID_TAGS: ['form', 'iframe', 'object', 'embed', 'script', 'style'],
	FORBID_ATTR: ['style'],
};

export default function SafeHtml({ as: Tag = 'div', html = '', ...props }) {
	const sanitizedHtml = DOMPurify.sanitize(html, SANITIZE_OPTIONS);
	return <Tag {...props} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
