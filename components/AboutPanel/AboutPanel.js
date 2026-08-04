import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gql, useQuery } from '@apollo/client';
import className from 'classnames/bind';
import styles from './AboutPanel.module.scss';
import { Signature } from '../../components';

let cx = className.bind(styles);

// The About page in WordPress, fetched by its URI. Its content is a set of
// Gutenberg blocks (headings/paragraphs) rendered as HTML.
const ABOUT_URI = '/about/';

const ABOUT_QUERY = gql`
	query AboutPanelContent($uri: String!) {
		nodeByUri(uri: $uri) {
			... on Page {
				title
				content
			}
		}
	}
`;

const PANEL_ENTER = 0.45; // seconds — slide-in duration before text reveals
const BLOCK_STAGGER = 0.09; // seconds between blocks
const EYEBROW_DELAY = PANEL_ENTER; // the "~/about" label reveals first
const CONTENT_BASE = PANEL_ENTER + BLOCK_STAGGER; // then the page blocks

export default function AboutPanel({ isOpen, onClose }) {
	// Keep the panel mounted through its exit animation. `mounted` gates the
	// portal; `closing` drives the reverse (slide-out) transition.
	const [mounted, setMounted] = useState(false);
	const [closing, setClosing] = useState(false);
	// Signature reveals last — after every content block. Its delay depends on
	// how many blocks the page has, so it's computed once the content mounts.
	const [sigDelay, setSigDelay] = useState(CONTENT_BASE + BLOCK_STAGGER);
	const panelRef = useRef(null);
	const closeBtnRef = useRef(null);
	const contentRef = useRef(null);

	// Fetch the About page once the panel first mounts; Apollo caches it for
	// subsequent opens.
	const { data } = useQuery(ABOUT_QUERY, {
		variables: { uri: ABOUT_URI },
		skip: !mounted,
	});
	const content = data?.nodeByUri?.content ?? '';

	// Portal target — only exists on the client.
	const [portalEl, setPortalEl] = useState(null);
	useEffect(() => {
		setPortalEl(document.body);
	}, []);

	// Open: mount immediately. Close: play the exit animation, then unmount.
	useEffect(() => {
		if (isOpen) {
			setClosing(false);
			setMounted(true);
		} else if (mounted) {
			const reduced =
				window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (reduced) {
				setMounted(false);
				return undefined;
			}
			setClosing(true);
			const t = setTimeout(() => setMounted(false), 400);
			return () => clearTimeout(t);
		}
		return undefined;
	}, [isOpen, mounted]);

	// Reveal the page content block by block: each top-level element gets the
	// staggered fade-in-up treatment. Runs whenever the content (re)mounts.
	useEffect(() => {
		const node = contentRef.current;
		if (!node || !content) return;

		const reduced =
			window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const blocks = Array.from(node.children);

		blocks.forEach((block, i) => {
			block.classList.add(cx('line'));
			block.style.animationDelay = reduced ? '0s' : `${CONTENT_BASE + i * BLOCK_STAGGER}s`;
		});

		setSigDelay(CONTENT_BASE + blocks.length * BLOCK_STAGGER);
	}, [content, mounted, closing]);

	// Lock body scroll while open, close on Escape, and move focus into the panel.
	useEffect(() => {
		if (!mounted || closing) return undefined;

		const { overflow } = document.body.style;
		document.body.style.overflow = 'hidden';

		const onKeyDown = (e) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);

		closeBtnRef.current?.focus();

		return () => {
			document.body.style.overflow = overflow;
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [mounted, closing, onClose]);

	if (!mounted || !portalEl) return null;

	return createPortal(
		<div className={cx('root', { closing })} role="dialog" aria-modal="true" aria-label="About">
			<div className={cx('backdrop')} onClick={onClose} />
			<aside className={cx('panel')} ref={panelRef}>
				<button
					type="button"
					className={cx('close')}
					onClick={onClose}
					aria-label="Close about panel"
					ref={closeBtnRef}
				>
					<span aria-hidden="true">×</span>
				</button>

				<div className={cx('content')}>
					<span className={cx('line', 'eyebrow')} style={{ animationDelay: `${EYEBROW_DELAY}s` }}>
						~/about
					</span>

					{/* WordPress About page content — each top-level block is
					    staggered in by the effect above. */}
					<div ref={contentRef} dangerouslySetInnerHTML={{ __html: content }} />

					<div className={cx('line', 'signature')} style={{ animationDelay: `${sigDelay}s` }}>
						<Signature />
					</div>
				</div>
			</aside>
		</div>,
		portalEl
	);
}
export { default as AboutPanel } from './AboutPanel';
