import React, { useEffect, useRef } from 'react';
import className from 'classnames/bind';
import styles from './GalleryBanner.module.scss';
import { getScrollVelocity } from '../../lib/scroll';

let cx = className.bind(styles);

// Seconds for one full loop of a row at rest. The marquee always drifts at this
// baseline; page scroll speeds it up (see the boost below).
const BASE_DURATION = 200;

// Scroll coupling, all off the shared Lenis value (getScrollVelocity). Lenis
// velocity (px/frame) is normalised into 0..1, eased into `boost`, and used to
// scale each row's speed by up to (1 + BOOST_GAIN)×. Easing is what keeps it
// smooth — the raw velocity is spiky, so we never apply it directly.
const SCROLL_NORM = 40; // px/frame that maps to a full boost
const BOOST_EASE = 0.06; // how fast the boost rises/decays (0..1) — lower = smoother
const BOOST_GAIN = 4; // extra row speed at full boost (×)

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

// Each preview URL is encoded in the image filename: `slug--path.ext` maps to
// `${PREVIEW_BASE}/slug/path`, where `--` stands in for the `/`. Inner single
// hyphens stay (e.g. `nu--portfolio-gallery` -> `nu/portfolio-gallery`). So the
// only per-image data below is `{ file, width, height }` — the src, link, and
// alt are all derived from the filename. width/height are the real intrinsic
// sizes so each row reserves space before the file loads (no layout shift).
const PREVIEW_BASE = 'https://preview.wolfthemes.store';

function stripExt(file) {
	return file.replace(/\.[^.]+$/, '');
}

// Preview URL from the filename, or null when the name carries no `--` (those
// images just render unlinked).
function deriveHref(file) {
	const name = stripExt(file);
	if (!name.includes('--')) return null;
	return `${PREVIEW_BASE}/${name.replace(/--/g, '/')}`;
}

// Readable alt text from the same filename: `sable--shop-home` -> "sable — shop
// home"; a name without `--` just has its hyphens spaced out.
function deriveAlt(file) {
	const [slug, ...rest] = stripExt(file).split('--');
	const label = rest.join(' ').replace(/-/g, ' ');
	return label ? `${slug} — ${label}` : slug.replace(/-/g, ' ');
}

// Rows scroll forever; direction alternates right / left / right.
const ROWS = [
	{
		direction: 'right',
		images: [
			{ file: 'aurenza--artistic-agency.jpg', width: 1707, height: 904 },
			{ file: 'omnity--home.jpg', width: 800, height: 614 },
			{ file: 'mediafoundry--creative-agency.jpg', width: 1600, height: 873 },
			{ file: 'sable--portfolio-vertical.jpg', width: 1600, height: 847 },
			{ file: 'yor--home.jpg', width: 1600, height: 867 },
			{ file: 'loud--main-home--parallax-showcase.jpg', width: 1400, height: 900 },
		],
	},
	{
		direction: 'left',
		images: [
			{ file: 'prequelle--designer-home.jpg', width: 1600, height: 758 },
			{ file: 'poize--event-countdown.jpg', width: 1600, height: 873 },
			{ file: 'mediafoundry--production-studio.jpg', width: 1600, height: 873 },
			{ file: 'sable--shop-home.jpg', width: 1600, height: 847 },
			{ file: 'gaintab--home.jpg', width: 1356, height: 848 },
			{ file: 'aurenza--event-spotlight.jpg', width: 1707, height: 904 },
		],
	},
	{
		direction: 'right',
		images: [
			{ file: 'soundkraft--home.jpg', width: 1707, height: 904 },
			{ file: 'morvan--vertical-presentation.jpg', width: 1600, height: 900 },
			{ file: 'phase--interactive-links.jpg', width: 858, height: 480 },
			{ file: 'nu--portfolio-gallery.jpg', width: 640, height: 350 },
			{ file: 'superflick--slider-presentation.webp', width: 748, height: 418 },
		],
	},
];

function MarqueeItem({ image, duplicate }) {
	const href = deriveHref(image.file);
	const img = (
		<img
			src={`/gallery/${image.file}`}
			width={image.width}
			height={image.height}
			// The duplicate set is decorative — blank alt so it isn't announced twice.
			alt={duplicate ? '' : deriveAlt(image.file)}
			loading="lazy"
			decoding="async"
		/>
	);

	return (
		<figure
			className={cx('marquee-item')}
			// The second (duplicate) set is hidden from assistive tech.
			aria-hidden={duplicate ? 'true' : undefined}
		>
			{href ? (
				<a
					className={cx('marquee-link')}
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					// Duplicate anchors are decorative; keep them out of the tab order.
					tabIndex={duplicate ? -1 : undefined}
				>
					{img}
				</a>
			) : (
				img
			)}
		</figure>
	);
}

function MarqueeRow({ direction, images }) {
	return (
		<div className={cx('marquee-row', `marquee-row--${direction}`)}>
			<div className={cx('marquee-track')} data-direction={direction} data-count={images.length}>
				{/* Real set — carries the descriptive alt text. */}
				{images.map((image, i) => (
					<MarqueeItem key={`real-${i}`} image={image} />
				))}
				{/* Identical duplicate set — makes the loop seamless. */}
				{images.map((image, i) => (
					<MarqueeItem key={`dup-${i}`} image={image} duplicate />
				))}
			</div>
		</div>
	);
}

export default function GalleryBanner() {
	const sectionRef = useRef(null);

	// Transform marquee whose speed rides the shared Lenis scroll velocity. Just
	// translateX on the compositor — no WebGL — so it stays smooth and cheap.
	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return undefined;

		// Reduced motion: leave the (paused) CSS animation in place, drive nothing.
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) return undefined;

		// Seamless loop distance = offset of the first duplicated figure (real-set
		// width + one gap). Stable before images load since item widths come from
		// the width/height attributes.
		const measurePeriod = (el) => {
			const count = Number(el.dataset.count) || 0;
			const first = el.children[0];
			const dup = el.children[count];
			return dup && first ? dup.offsetLeft - first.offsetLeft : el.scrollWidth / 2;
		};

		const tracks = Array.from(section.querySelectorAll('[data-direction]')).map((el) => {
			el.style.animation = 'none'; // take over from the CSS marquee
			el.style.willChange = 'transform';
			return {
				el,
				dir: el.dataset.direction === 'left' ? 1 : -1,
				period: measurePeriod(el),
				pos: 0,
			};
		});

		const onResize = () => {
			tracks.forEach((t) => {
				t.period = measurePeriod(t.el);
			});
		};
		window.addEventListener('resize', onResize);

		let raf = 0;
		let last = performance.now();
		let visible = false;
		let boost = 0; // eased scroll boost, 0..1
		const frame = (now) => {
			const dt = Math.min((now - last) / 1000, 0.05); // clamp after tab switches
			last = now;

			// Ease toward the current (normalised) Lenis velocity — never apply the
			// raw spiky value, which is what makes scroll-driven marquees jump.
			const sv = clamp01(Math.abs(getScrollVelocity()) / SCROLL_NORM);
			boost += (sv - boost) * BOOST_EASE;

			const factor = 1 + boost * BOOST_GAIN;
			tracks.forEach((t) => {
				if (t.period <= 0) return;
				const speed = (t.period / BASE_DURATION) * factor; // px/s
				t.pos = (t.pos + speed * dt) % t.period;
				// dir 1 (left) slides content left; dir -1 (right) slides it right.
				const x = t.dir === 1 ? -t.pos : t.pos - t.period;
				t.el.style.transform = `translate3d(${x}px, 0, 0)`;
			});

			// Stop when scrolled away or the tab is hidden; the observer restarts it.
			if (!visible || document.hidden) {
				raf = 0;
				return;
			}
			raf = requestAnimationFrame(frame);
		};

		const start = () => {
			if (!raf) {
				last = performance.now();
				raf = requestAnimationFrame(frame);
			}
		};
		const io = new IntersectionObserver(
			(entries) => {
				visible = entries[0].isIntersecting;
				if (visible && !document.hidden) start();
			},
			{ rootMargin: '200px' }
		);
		io.observe(section);
		const onVisibility = () => {
			if (!document.hidden && visible) start();
		};
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			if (raf) cancelAnimationFrame(raf);
			io.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('resize', onResize);
			tracks.forEach((t) => {
				t.el.style.animation = '';
				t.el.style.transform = '';
				t.el.style.willChange = '';
			});
		};
	}, []);

	return (
		// Straight-edged clip so the banner can't spill onto neighbours or add a
		// horizontal scrollbar.
		<div className={cx('gallery-clip')}>
			<section ref={sectionRef} className={cx('gallery-banner')} aria-labelledby="gallery-title">
				<h2 id="gallery-title" className="sr-only">
					Selected work
				</h2>
				{ROWS.map((row, i) => (
					<MarqueeRow key={i} direction={row.direction} images={row.images} />
				))}
			</section>
		</div>
	);
}
