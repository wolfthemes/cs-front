import React, { useEffect, useMemo, useRef } from 'react';
import className from 'classnames/bind';
import styles from './ScrollFadeText.module.scss';
import { onScrollFrame } from '../../lib/scroll';

let cx = className.bind(styles);

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll-scrubbed opacity reveal, per character. Each letter rests dimmed
// (`minOpacity`) and lights up to full opacity as the element scrolls from the
// bottom of the viewport toward the centre — a bright "head" sweeping letter by
// letter. Direct port of the GSAP ScrollTrigger + SplitType reference (split
// into chars, opacity 0.1 → 1, staggered, `scrub`) into this project's rAF idiom.
//
// Characters are split like SplitType does it: each WORD is its own inline-block
// wrapper (so it never breaks mid-word) and holds inline-block char spans, while
// plain spaces sit between the words — so the copy wraps exactly like normal
// text, no manufactured line breaks.
//
// Props:
//   as          tag to render (default 'p')
//   text        the copy
//   className   applied verbatim to the wrapper so the caller keeps its own
//               typography (e.g. Statement's `.headline`)
//   minOpacity  resting opacity of a not-yet-lit char (default 0.1, per ref)
//   band        share of the scroll range a char transitions over; larger =
//               softer, more chars mid-fade at once (default 0.15)
//   startOffset px below the viewport bottom where the sweep begins (default 100)
export default function ScrollFadeText({
	as: Tag = 'p',
	text,
	className: cls,
	minOpacity = 0.1,
	band = 0.15,
	startOffset = 100,
}) {
	const containerRef = useRef(null);
	const charRefs = useRef([]);

	// Split into words, each word into its characters. A flat char list lets the
	// scroll loop assign every letter a position along the sweep.
	const words = useMemo(
		() =>
			String(text)
				.trim()
				.split(/\s+/)
				.map((w) => Array.from(w)),
		[text]
	);
	const charCount = useMemo(() => words.reduce((n, w) => n + w.length, 0), [words]);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return undefined;

		if (prefersReducedMotion()) {
			charRefs.current.forEach((node) => node && (node.style.opacity = '1'));
			return undefined;
		}

		const update = () => {
			const rect = el.getBoundingClientRect();
			const vh = window.innerHeight || document.documentElement.clientHeight;

			// Sweep starts when the element's top sits `startOffset` above the
			// viewport bottom and completes when its centre reaches the viewport
			// centre — the scrubbed range GSAP expresses as
			// start:"top+=offset bottom" / end:"center center".
			const startTop = vh - startOffset;
			const endTop = vh / 2 - rect.height / 2;
			const denom = startTop - endTop || 1;
			const progress = Math.max(0, Math.min(1, (startTop - rect.top) / denom));

			const nodes = charRefs.current;
			const n = nodes.length;
			for (let i = 0; i < n; i++) {
				const node = nodes[i];
				if (!node) continue;
				const pos = n > 1 ? i / (n - 1) : 0;
				// Moving head: progress pushed just past 1 so the last char still
				// fully lights, minus this char's position, scaled by `band`.
				let local = (progress * (1 + band) - pos) / band;
				local = Math.max(0, Math.min(1, local));
				node.style.opacity = String(minOpacity + (1 - minOpacity) * local);
			}
		};

		// Shares the app's Lenis rAF (same loop VideoScrollBackground etc. use)
		// instead of a second independent scroll+rAF pair — running two rAF loops
		// at once is what was making the video scrub jank. This one fires every
		// frame the loop is alive, so it naturally tracks resizes too.
		return onScrollFrame(update);
	}, [charCount, minOpacity, band, startOffset]);

	// Running index across all words so each char maps to one entry in charRefs.
	let charIndex = 0;

	return (
		<Tag ref={containerRef} className={cls} aria-label={text}>
			{words.map((chars, wi) => (
				<React.Fragment key={wi}>
					<span className={cx('word')} aria-hidden="true">
						{chars.map((ch, ci) => {
							const idx = charIndex++;
							return (
								<span
									key={ci}
									className={cx('char')}
									style={{ opacity: minOpacity }}
									ref={(node) => {
										charRefs.current[idx] = node;
									}}
								>
									{ch}
								</span>
							);
						})}
					</span>
					{wi < words.length - 1 ? ' ' : ''}
				</React.Fragment>
			))}
		</Tag>
	);
}
