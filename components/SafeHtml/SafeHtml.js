import { FilterXSS, getDefaultWhiteList } from 'xss';

// xss is CommonJS with CJS-only deps: Vercel's runtime cannot require() ESM-only
// packages (jsdom, sanitize-html's htmlparser2 both crashed every page). Unknown tags
// are dropped, script/style bodies removed, inline styles and event handlers never
// allowed; classes/ids are kept so WordPress markup still styles and anchors work.
const EMBED_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];

const base = getDefaultWhiteList();
const whiteList = {
	...Object.fromEntries(Object.entries(base).map(([tag, attrs]) => [tag, [...attrs, 'class', 'id']])),
	img: [...base.img, 'class', 'id', 'srcset', 'sizes', 'loading', 'decoding', 'width', 'height'],
	video: [...base.video, 'class', 'id', 'src', 'poster', 'preload', 'playsinline', 'loop', 'muted'],
	audio: [...base.audio, 'class', 'id', 'src'],
	source: ['src', 'srcset', 'sizes', 'type', 'media'],
	picture: ['class', 'id'],
	iframe: ['class', 'id', 'src', 'title', 'width', 'height', 'allowfullscreen', 'loading'],
	button: ['class', 'id', 'type'],
};

const filter = new FilterXSS({
	whiteList,
	stripIgnoreTag: true,
	stripIgnoreTagBody: ['script', 'style', 'object', 'embed', 'form'],
	// iframes only survive with an https src on an allowlisted embed host
	onTagAttr(tag, name, value) {
		if (tag === 'iframe' && name === 'src') {
			try {
				const u = new URL(value, 'https://invalid.invalid');
				if (u.protocol === 'https:' && EMBED_HOSTS.includes(u.hostname)) return;
			} catch {}
			return '';
		}
	},
});

export default function SafeHtml({ as: Tag = 'div', html = '', ...props }) {
	return <Tag {...props} dangerouslySetInnerHTML={{ __html: filter.process(html) }} />;
}
