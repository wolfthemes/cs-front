import React, { useEffect, useRef, useState } from 'react';
import styles from './SplitLines.module.scss';

// Splits a run of words into their REAL wrapped lines (measured at the live
// column width) and renders each line as its own block so callers can animate
// them one by one. Unlike a hardcoded line array, the breaks follow whatever the
// browser actually does at the current width / font — re-measured on resize and
// once web fonts have settled.
//
// Props:
//   words        [{ text, className? }]   — the words, in order. `className`
//                                           lets a word carry its real styling
//                                           so its width measures correctly.
//   renderWord   (word, index) => node    — how to render a word in the visible
//                                           output (e.g. wrap a special word, or
//                                           swap in an interactive component).
//                                           Defaults to the plain text.
//   lineClassName                         — class applied to each line block.
//   baseDelay / stagger (seconds)         — per-line animationDelay, set inline.
//
// A hidden, zero-height measuring layer holds the plain words and stays mounted
// so re-measures (fonts/resize) work. Before the first measure the words render as one hidden run (still in the DOM
// for crawlers / screen readers) so there is no flash before the lines animate in.
const LINE_TOLERANCE = 2; // px of slack when comparing left edges

export default function SplitLines({
	words,
	renderWord = (word) => word.text,
	lineClassName,
	baseDelay = 0,
	stagger = 0,
}) {
	const measureRef = useRef(null);
	// Groups are stored with the word list they were measured for: if `words`
	// changes (e.g. language switch) the old indices are stale and must not be used.
	const [measured, setMeasured] = useState(null);
	const lines = measured && measured.words === words ? measured.groups : null;

	useEffect(() => {
		const el = measureRef.current;
		if (!el) return undefined;

		const measure = () => {
			const spans = Array.from(el.children);
			if (!spans.length) return;
			// New line = the word's left edge jumps back. Unlike comparing tops, this
			// is immune to words in taller fonts (serif / brush) sitting at a
			// different height on the same line.
			const groups = [];
			let current = [];
			let prevLeft = -Infinity;
			spans.forEach((span, i) => {
				const left = span.getBoundingClientRect().left;
				if (left < prevLeft - LINE_TOLERANCE && current.length) {
					groups.push(current);
					current = [];
				}
				current.push(i);
				prevLeft = left;
			});
			if (current.length) groups.push(current);
			setMeasured({ words, groups });
		};

		measure();

		let cancelled = false;
		const fontsReady =
			(typeof document !== 'undefined' && document.fonts && document.fonts.ready) ||
			Promise.resolve();
		fontsReady.then(() => {
			if (!cancelled) measure();
		});

		window.addEventListener('resize', measure);
		return () => {
			cancelled = true;
			window.removeEventListener('resize', measure);
		};
	}, [words]);

	return (
		<>
			{/* Hidden measuring layer: the same words as plain inline spans separated by real
			    spaces, so it wraps exactly like the visible copy. Kept mounted for re-measures. */}
			<span ref={measureRef} aria-hidden="true" className={styles.measure}>
				{words.map((w, i) => (
					<React.Fragment key={i}>
						<span className={w.className}>{w.text}</span>{' '}
					</React.Fragment>
				))}
			</span>

			{lines ? (
				lines.map((group, li) => (
					<span
						key={li}
						className={lineClassName}
						style={{ animationDelay: `${baseDelay + li * stagger}s` }}
					>
						{group.map((wi) => (
							<React.Fragment key={wi}>{renderWord(words[wi], wi)} </React.Fragment>
						))}
					</span>
				))
			) : (
				// Not measured yet (SSR / first paint): keep the copy in the DOM for
				// crawlers and screen readers, but invisible, so it can't flash before
				// the lines mount and animate in.
				<span style={{ visibility: 'hidden' }}>
					{words.map((w, i) => (
						<React.Fragment key={i}>{renderWord(w, i)} </React.Fragment>
					))}
				</span>
			)}
		</>
	);
}
