import React from 'react';
import className from 'classnames/bind';
import styles from './CurtainText.module.scss';

let cx = className.bind(styles);

const BASE_DELAY = 0.15; // seconds before the first letter (load mode)
const STAGGER = 0.045; // seconds between letters

// Letter-by-letter "curtain" reveal. Each glyph rolls/unveils via clip-path
// (which, unlike an overflow mask, keeps the inline baseline intact).
//   trigger="load"  → plays once on mount (entrance).
//   trigger="hover" → each letter rolls when the word is hovered, staggered.
// The word carries an aria-label and the letters are aria-hidden, so it reads
// as one word. Reusable anywhere: <CurtainText text="..." trigger="hover" />.
export default function CurtainText({
	text,
	trigger = 'load',
	baseDelay = BASE_DELAY,
	stagger = STAGGER,
}) {
	const isHover = trigger === 'hover';
	const letters = Array.from(String(text));
	return (
		<span className={cx('curtain', { 'is-hover': isHover })} aria-label={text}>
			{letters.map((ch, i) => (
				<span
					key={i}
					className={cx('letter')}
					aria-hidden="true"
					style={{ animationDelay: `${(isHover ? 0 : baseDelay) + i * stagger}s` }}
				>
					{ch === ' ' ? ' ' : ch}
				</span>
			))}
		</span>
	);
}
