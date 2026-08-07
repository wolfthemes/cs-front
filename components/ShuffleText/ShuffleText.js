import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './ShuffleText.module.scss';

let cx = className.bind(styles);

const LOWER = 'abcdefghijklmnopqrstuvwxyz';

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A random glyph that matches the case of the target character.
function randomGlyphFor(ch) {
	const g = LOWER[(Math.random() * LOWER.length) | 0];
	const isUpper = ch !== ch.toLowerCase() && ch === ch.toUpperCase();
	return isUpper ? g.toUpperCase() : g;
}

// Character "shuffle" à la jquery.chuffle: on hover each glyph cycles through
// random letters, then settles onto its final character one by one, left to
// right. The final word is always in the DOM (a hidden "ghost") so it reserves
// the exact box — the shuffling glyphs are overlaid on top and never reflow the
// surrounding text. The word reads as one via aria-label; the visual layers are
// aria-hidden. It also replays on hover/focus. Pass `autoPlayDelay` (ms) to
// fire once on mount after that delay, or `play` to fire once when it flips
// truthy (e.g. after another animation finishes). Reusable anywhere:
// <ShuffleText text="..." />.
export default function ShuffleText({
	text,
	autoPlayDelay = null, // ms after mount to auto-fire once; null disables
	play = false, // external trigger: runs once when this becomes truthy
	shuffleDuration = 240, // ms a glyph spends scrambling before it locks
	stagger = 55, // ms between one glyph locking and the next (the L→R sweep)
	tick = 40, // ms between random-letter swaps while scrambling
}) {
	// The target characters. Memoized so it's stable across renders (it drives the
	// per-frame setDisplay and is a dependency of `run`). Future work: write glyphs
	// straight to the DOM via a ref to avoid a re-render per scramble frame.
	const final = useMemo(() => Array.from(String(text)), [text]);
	const [display, setDisplay] = useState(final);
	const rafRef = useRef(null);
	const runningRef = useRef(false);

	const run = useCallback(() => {
		if (runningRef.current || prefersReducedMotion()) return;
		runningRef.current = true;

		const start = performance.now();
		const lockAt = final.map((_, i) => i * stagger + shuffleDuration);
		const total = lockAt[lockAt.length - 1] || 0;
		const rnd = final.map((ch) => randomGlyphFor(ch));
		let lastSwap = start;

		const frame = (now) => {
			if (!runningRef.current) return;
			const elapsed = now - start;

			if (now - lastSwap >= tick) {
				for (let i = 0; i < rnd.length; i++) rnd[i] = randomGlyphFor(final[i]);
				lastSwap = now;
			}

			setDisplay(final.map((ch, i) => (ch === ' ' || elapsed >= lockAt[i] ? ch : rnd[i])));

			if (elapsed < total) {
				rafRef.current = requestAnimationFrame(frame);
			} else {
				setDisplay(final);
				runningRef.current = false;
			}
		};

		rafRef.current = requestAnimationFrame(frame);
	}, [final, shuffleDuration, stagger, tick]);

	// Fire once on mount, `autoPlayDelay` ms after the page settles.
	useEffect(() => {
		if (autoPlayDelay == null) return undefined;
		const timer = setTimeout(run, autoPlayDelay);
		return () => {
			clearTimeout(timer);
			runningRef.current = false;
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [autoPlayDelay, run]);

	// Fire once when `play` flips truthy (external trigger).
	const playedRef = useRef(false);
	useEffect(() => {
		if (play && !playedRef.current) {
			playedRef.current = true;
			run();
		}
	}, [play, run]);

	return (
		<span className={cx('shuffle')} aria-label={text} onMouseEnter={run} onFocus={run}>
			<span className={cx('ghost')} aria-hidden="true">
				{text}
			</span>
			<span className={cx('anim')} aria-hidden="true">
				{display.map((ch, i) => (ch === ' ' ? ' ' : ch)).join('')}
			</span>
		</span>
	);
}
