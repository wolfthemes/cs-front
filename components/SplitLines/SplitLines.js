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
// so re-measures (fonts/resize) work. Before the first measure — and with no JS
// — the words render as one flowing run, so the copy is always present.
const LINE_TOLERANCE = 4; // px; tops within this count as the same line

export default function SplitLines({
	words,
	renderWord = (word) => word.text,
	lineClassName,
	baseDelay = 0,
	stagger = 0,
}) {
	const measureRef = useRef(null);
	const [lines, setLines] = useState(null);

	useEffect(() => {
		const el = measureRef.current;
		if (!el) return undefined;

		const measure = () => {
			const spans = Array.from(el.children);
			if (!spans.length) return;
			const groups = [];
			let current = [];
			let lineTop = null;
			spans.forEach((span, i) => {
				const top = span.offsetTop;
				if (lineTop !== null && top > lineTop + LINE_TOLERANCE && current.length) {
					groups.push(current);
					current = [];
					lineTop = top;
				}
				if (lineTop === null || top < lineTop) lineTop = top;
				current.push(i);
			});
			if (current.length) groups.push(current);
			setLines(groups);
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
			{/* Hidden measuring layer — plain words, kept mounted for re-measures. */}
			<span ref={measureRef} aria-hidden="true" className={styles.measure}>
				{words.map((w, i) => (
					<span key={i} className={w.className} style={{ display: 'inline-block' }}>
						{w.text}{' '}
					</span>
				))}
			</span>

			{lines
				? lines.map((group, li) => (
						<span
							key={li}
							className={lineClassName}
							style={{ animationDelay: `${baseDelay + li * stagger}s` }}
						>
							{group.map((wi) => (
								<React.Fragment key={wi}>
									{renderWord(words[wi], wi)}{' '}
								</React.Fragment>
							))}
						</span>
				  ))
				: words.map((w, i) => (
						<React.Fragment key={i}>
							{renderWord(w, i)}{' '}
						</React.Fragment>
				  ))}
		</>
	);
}
