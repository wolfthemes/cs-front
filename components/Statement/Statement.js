import React, { useEffect, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './Statement.module.scss';
import { Signature } from '../../components';
import { onScrollFrame } from '../../lib/scroll';

let cx = className.bind(styles);

// Placeholder copy — the big headline reveals word-by-word on scroll, the two
// paragraphs below sit offset to the right (see layout ref).
const HEADLINE =
	'From scaling modern infrastructures to engineering smooth interactive experiences, I build modern websites designed for longevity and performance.';

const LEAD =
	'I build robust WordPress products that solve real business needs and deliver lasting value. My work goes beyond clean interfaces — it combines thoughtful engineering, performance, and usability to create websites people enjoy using.';

const SUPPORT =
	'I started in the late 00\'s by designing MySpace profiles for bands.  Now I create full web solutions. I love to work with musicians, labels, artists, associations and small businesses.';

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LINE_STAGGER = 0.11; // seconds between each line's slide-up

// Splits a paragraph into its real wrapped lines (measured against the live
// column width) and slides each line up, staggered, once it scrolls into view.
// `startIndex` continues the stagger across paragraphs so the whole block reads
// as one cascade; `onMeasured` reports the line count so the next paragraph can
// pick up where this one left off.
function RevealParagraph({ text, className: cls, startIndex = 0, onMeasured }) {
	const ref = useRef(null);
	const [lines, setLines] = useState(null);

	// Measure the wrapped lines by laying the words out in a hidden clone that
	// matches the paragraph's rendered width, then grouping words by their top.
	useEffect(() => {
		const el = ref.current;
		if (!el) return undefined;

		if (prefersReducedMotion()) {
			setLines([text]);
			el.classList.add(styles['is-visible']);
			onMeasured?.(1);
			return undefined;
		}

		let cancelled = false;

		const measure = () => {
			if (cancelled || !el.parentNode) return;
			const temp = document.createElement('p');
			temp.className = el.className;
			temp.style.cssText =
				'position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;';
			temp.style.width = `${el.clientWidth}px`;
			// Collapse runs of whitespace so a stray double space can't create an
			// empty token (which would otherwise skew the line grouping).
			const words = text.trim().split(/\s+/);
			temp.innerHTML = words
				.map(
					(w) =>
						`<span style="display:inline-block">${w
							.replace(/&/g, '&amp;')
							.replace(/</g, '&lt;')}</span>`
				)
				.join(' ');
			el.parentNode.appendChild(temp);

			const spans = Array.from(temp.querySelectorAll('span'));
			const groups = [];
			let current = [];
			let lastTop = null;
			spans.forEach((span, i) => {
				const top = span.offsetTop;
				if (lastTop !== null && top > lastTop && current.length) {
					groups.push(current);
					current = [];
				}
				current.push(words[i]);
				lastTop = top;
			});
			if (current.length) groups.push(current);
			el.parentNode.removeChild(temp);

			if (cancelled) return;
			const grouped = groups.map((g) => g.join(' '));
			setLines(grouped);
			onMeasured?.(grouped.length);
		};

		// Measure once now, then again after the web fonts swap in — the fallback
		// font wraps at different widths, so grouping before fonts are ready would
		// break the lines at the wrong words.
		measure();
		const fontsReady = document.fonts?.ready ?? Promise.resolve();
		fontsReady.then(() => measure());

		// Keep the line grouping correct across viewport width changes.
		let resizeRaf = 0;
		const onResize = () => {
			cancelAnimationFrame(resizeRaf);
			resizeRaf = requestAnimationFrame(measure);
		};
		window.addEventListener('resize', onResize);

		return () => {
			cancelled = true;
			cancelAnimationFrame(resizeRaf);
			window.removeEventListener('resize', onResize);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [text]);

	// Reveal once the paragraph enters the viewport.
	useEffect(() => {
		const el = ref.current;
		if (!el) return undefined;

		const observer = new IntersectionObserver(
			([entry], obs) => {
				if (entry.isIntersecting) {
					el.classList.add(styles['is-visible']);
					obs.disconnect();
				}
			},
			// Fire once the paragraph is comfortably into view, not the moment its
			// top edge peeks in — the bottom margin holds the trigger back ~25%.
			{ threshold: 0, rootMargin: '0px 0px -25% 0px' }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<p ref={ref} className={cx(cls)}>
			{lines
				? lines.map((line, i) => (
						<span className={cx('reveal-line')} key={i}>
							<span
								className={cx('reveal-line-inner')}
								style={{ transitionDelay: `${(startIndex + i) * LINE_STAGGER}s` }}
							>
								{line}
							</span>
						</span>
				  ))
				: text}
		</p>
	);
}

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Per-word ease (matches GSAP's 'expo.out') — fast in, long gentle settle.
const easeExpoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

// Catch-up factor for the smoothed scrub. Lower = more lag / smoother; this
// approximates GSAP's `scrub: 1.2` (the animation eases toward the scroll
// position instead of tracking it frame-for-frame).
const SCRUB_SMOOTH = 0.16;

// Fraction of the sweep that is mid-transition at once. Wider than a single
// character, so the reveal edge is a soft gradient across several letters
// rather than a hard on/off — this is what keeps it from feeling brutal.
const FEATHER = 0.16;

export default function Statement() {
	const headlineRef = useRef(null);
	const charsRef = useRef([]);
	// Line count of the first paragraph, so the second continues the cascade.
	const [leadLineCount, setLeadLineCount] = useState(0);
	const handleLeadMeasured = (count) => {
		setLeadLineCount((current) => (current === count ? current : count));
	};

	useEffect(() => {
		const chars = charsRef.current.filter(Boolean);
		if (!chars.length) return undefined;

		if (prefersReducedMotion()) {
			chars.forEach((el) => {
				el.style.opacity = '1';
				el.style.filter = 'none';
				el.style.transform = 'none';
			});
			return undefined;
		}

		let current = 0; // smoothed progress (lags behind the scroll target)
		let painted = -1;
		let active = false;

		const paint = (progress) => {
			const total = chars.length;
			const slice = 1 / total;
			// Each char's start offset (i * slice) eats into the range, so raw
			// progress can't drive the last letter to a full reveal. Stretch progress
			// across the true span so every letter resolves by the end of the band.
			const revealSpan = (total - 1) * slice + FEATHER;
			const scaled = progress * revealSpan;

			for (let i = 0; i < total; i += 1) {
				// Ease each letter individually (expo.out), like the GSAP reference.
				const p = easeExpoOut(clamp((scaled - i * slice) / FEATHER, 0, 1));
				const inv = 1 - p;
				// Soft ghost → sharp: gentler blur / skew / lift than the word version.
				chars[i].style.opacity = (0.22 + 0.78 * p).toFixed(3);
				chars[i].style.filter = `blur(${(inv * 2.5).toFixed(2)}px)`;
				chars[i].style.transform = `translateY(${(inv * 0.18).toFixed(
					3
				)}em) skewY(${(inv * 2).toFixed(2)}deg)`;
			}
		};
		paint(0);
		painted = 0;

		// Continuous rAF loop (same approach as GalleryBanner): the reveal is bound
		// to the live scroll position every frame — a true scrub that runs forward
		// and backward with the scrollbar — not a one-shot trigger on visibility.
		// `current` eases toward the scroll target for a smooth, GSAP-scrub feel,
		// and it stays in sync with Lenis smooth scrolling.
		const unsubscribe = onScrollFrame(() => {
			if (!active) return;

			const el = headlineRef.current;
			if (el) {
				const rect = el.getBoundingClientRect();
				const vh = window.innerHeight || document.documentElement.clientHeight;

				// Track the block's CENTER through the viewport so the resolve keeps
				// happening while the headline sits in the reading zone.
				const mid = rect.top + rect.height / 2;
				const start = vh * 0.95; // center at the bottom → nothing revealed
				const end = vh * 0.35; // center in the upper third → fully revealed
				const target = clamp((start - mid) / (start - end), 0, 1);

				current += (target - current) * SCRUB_SMOOTH;
				if (Math.abs(target - current) < 0.0005) current = target;

				if (Math.abs(current - painted) > 0.0002) {
					paint(current);
					painted = current;
				}
			}
		});

		const observer = new IntersectionObserver(
			([entry]) => {
				active = entry.isIntersecting;
				if (!active) {
					current = entry.boundingClientRect.top < 0 ? 1 : 0;
					paint(current);
					painted = current;
				}
			},
			// Keep the scrub live while the headline is approaching / leaving the
			// viewport, but stop the per-character writes once the paragraph block is
			// the only thing animating.
			{ threshold: 0, rootMargin: '20% 0px 20% 0px' }
		);
		observer.observe(headlineRef.current);

		return () => {
			observer.disconnect();
			unsubscribe();
		};
	}, []);

	// Words stay whole for wrapping; letters inside animate individually. A flat
	// running index maps each letter to its slot in charsRef / the reveal sweep.
	const words = HEADLINE.split(' ');
	let charIndex = 0;

	return (
		<section id="about" className={cx('component')}>
			<p className={cx('eyebrow')}>~/about</p>
			<h2 className={cx('headline')} ref={headlineRef}>
				{words.map((word, wi) => (
					<React.Fragment key={wi}>
						<span className={cx('word')}>
							{word.split('').map((ch, ci) => {
								const idx = charIndex;
								charIndex += 1;
								return (
									<span
										key={ci}
										ref={(el) => {
											charsRef.current[idx] = el;
										}}
										className={cx('char')}
									>
										{ch}
									</span>
								);
							})}
						</span>
						{wi < words.length - 1 ? ' ' : ''}
					</React.Fragment>
				))}
			</h2>

			<div className={cx('body')}>
				<RevealParagraph text={LEAD} className="lead" onMeasured={handleLeadMeasured} />
				<RevealParagraph text={SUPPORT} className="support" startIndex={leadLineCount} />
			</div>

			<Signature className={cx('signature')} />
		</section>
	);
}
