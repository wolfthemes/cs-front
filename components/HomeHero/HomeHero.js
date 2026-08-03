import React, { useEffect, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './HomeHero.module.scss';

let cx = className.bind(styles);

// Explicit line breaks so the copy animates line by line (each is its own
// block with a staggered fade-in-up).
const LINES = [
	'From scaling modern infrastructures to engineering',
	'smooth interactive experiences, I build modern',
	'WordPress products designed for longevity',
	'and performance.',
];

const LINE_BASE_DELAY = 0.2; // seconds
const LINE_STAGGER = 0.15; // seconds between lines

// Stats counted up below the statement. `value` is the target the counter
// animates to; `decimals` keeps the display stable (e.g. 4.5), `suffix` is the
// static accent unit that never animates.
const STATS = [
	{ value: 14, decimals: 0, suffix: 'y', label: 'Professional experience' },
	{ value: 36, decimals: 0, suffix: 'k+', label: 'Installs in production' },
	{ value: 4.5, decimals: 1, suffix: '/5', label: 'Average rating (1,600+ reviews)' },
];

const COUNT_DURATION = 1400; // ms
const COUNT_START_DELAY = 700; // ms — let the statement settle first

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// easeOutCubic — fast start, gentle landing.
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// Count a single number from 0 to `value` once the row scrolls into view.
function useCountUp(value, decimals, ref) {
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		const node = ref.current;
		if (!node) return undefined;

		if (prefersReducedMotion()) {
			setDisplay(value);
			return undefined;
		}

		let rafId;
		let startTs;
		let delayTimer;

		const step = (ts) => {
			if (startTs === undefined) startTs = ts;
			const progress = Math.min((ts - startTs) / COUNT_DURATION, 1);
			setDisplay(value * easeOut(progress));
			if (progress < 1) rafId = requestAnimationFrame(step);
		};

		const observer = new IntersectionObserver(
			(entries, obs) => {
				if (entries[0].isIntersecting) {
					obs.disconnect();
					delayTimer = setTimeout(() => {
						rafId = requestAnimationFrame(step);
					}, COUNT_START_DELAY);
				}
			},
			{ threshold: 0.4 }
		);

		observer.observe(node);

		return () => {
			observer.disconnect();
			if (rafId) cancelAnimationFrame(rafId);
			if (delayTimer) clearTimeout(delayTimer);
		};
	}, [value, decimals, ref]);

	return display.toFixed(decimals);
}

function Stat({ value, decimals, suffix, label, rowRef }) {
	const display = useCountUp(value, decimals, rowRef);
	return (
		<div className={cx('stat')}>
			<span className={cx('stat-value')}>
				{display}
				<span className={cx('stat-suffix')}>{suffix}</span>
			</span>
			<span className={cx('stat-label')}>{label}</span>
		</div>
	);
}

// Render a line, setting the word "WordPress" in EB Garamond via `.wordpress`.
function renderLine(line) {
	return line.split(/(WordPress)/).map((part, i) =>
		part === 'WordPress' ? (
			<span key={i} className={cx('wordpress')}>
				{part}
			</span>
		) : (
			part
		)
	);
}

export default function HomeHero() {
	const statsRef = useRef(null);

	return (
		<section className={cx('component')}>
			<p className={cx('intro')}>
				{LINES.map((line, i) => (
					<span
						key={i}
						className={cx('line')}
						style={{
							animationDelay: `${LINE_BASE_DELAY + i * LINE_STAGGER}s`,
						}}
					>
						{renderLine(line)}
					</span>
				))}
			</p>

			<div className={cx('stats')} ref={statsRef}>
				{STATS.map((stat) => (
					<Stat key={stat.label} {...stat} rowRef={statsRef} />
				))}
			</div>
		</section>
	);
}
