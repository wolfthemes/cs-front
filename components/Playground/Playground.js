import React, { useEffect, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './Playground.module.scss';
import { useCopy } from '../../lib/i18n';

let cx = className.bind(styles);

// Column titles/items live in lib/i18n.js; `glyph` names one of the marks below.
const GLYPHS = ['stack', 'grid', 'chevrons'];

// Per-column reveal cadence.
const COL_STAGGER = 0.12; // seconds between columns

// Small decorative marks (currentColor) echoing the reference's geometric
// glyphs. Purely presentational, so hidden from assistive tech.
function Glyph({ name }) {
	const common = {
		width: 44,
		height: 44,
		viewBox: '0 0 44 44',
		fill: 'currentColor',
		'aria-hidden': 'true',
		focusable: 'false',
	};
	if (name === 'stack') {
		return (
			<svg {...common}>
				<rect x="6" y="6" width="20" height="20" transform="rotate(12 16 16)" />
				<rect x="18" y="20" width="20" height="20" transform="rotate(-8 28 30)" opacity="0.55" />
			</svg>
		);
	}
	if (name === 'grid') {
		return (
			<svg {...common}>
				<rect x="4" y="4" width="36" height="10" />
				<rect x="4" y="18" width="16" height="22" />
				<rect x="24" y="18" width="16" height="22" opacity="0.55" />
			</svg>
		);
	}
	// chevrons
	return (
		<svg {...common}>
			<path d="M4 6 L18 22 L4 38 L10 38 L24 22 L10 6 Z" />
			<path d="M20 6 L34 22 L20 38 L26 38 L40 22 L26 6 Z" opacity="0.55" />
		</svg>
	);
}

function Column({ column, index }) {
	const number = String(index + 1).padStart(2, '0');
	return (
		<div className={cx('column')} style={{ animationDelay: `${index * COL_STAGGER}s` }}>
			<p className={cx('index')}>
				<span className={cx('dot')} aria-hidden="true" />
				{number}
			</p>
			<h3 className={cx('column-title')}>{column.title}</h3>
			<ul className={cx('list')}>
				{column.items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
			<span className={cx('glyph')}>
				<Glyph name={column.glyph} />
			</span>
		</div>
	);
}

export default function Playground() {
	const { playground } = useCopy();
	const sectionRef = useRef(null);
	const [revealed, setRevealed] = useState(false);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return undefined;

		const reduce =
			window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			setRevealed(true);
			return undefined;
		}

		const observer = new IntersectionObserver(
			(entries, obs) => {
				if (entries[0].isIntersecting) {
					setRevealed(true);
					obs.disconnect();
				}
			},
			{ threshold: 0.2 }
		);
		observer.observe(section);

		return () => observer.disconnect();
	}, []);

	return (
		<section
			id="playground"
			ref={sectionRef}
			className={cx('component', { 'is-revealed': revealed })}
			aria-labelledby="playground-title"
		>
			<div className={cx('head')}>
				<p className={cx('eyebrow')}>~/playground</p>
				<h2 id="playground-title" className={cx('title')}>
					{playground.title}
				</h2>
			</div>

			<div className={cx('columns')}>
				{playground.columns.map((title, i) => (
					<Column
						key={GLYPHS[i]}
						column={{ title, glyph: GLYPHS[i], items: playground.items[i] }}
						index={i}
					/>
				))}
			</div>
		</section>
	);
}
