import React, { useEffect, useMemo, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './HomeHero.module.scss';
// import HeroCircle from './HeroCircle'; // ellipse disabled for now
import { ShuffleText, SplitLines } from '../../components';

let cx = className.bind(styles);

// One flowing paragraph. SplitLines measures its real wrapped lines so each one
// can animate in, instead of hardcoding the breaks.
const INTRO =
	"Founder of WolfThemes, I've been building commercial WordPress products used by " +
	'more than 36,000 customers worldwide. Today, I focus on engineering modern, scalable ' +
	'web applications designed for performance and longevity.';

// Words carry the class of any styled term so they measure at their real width
// (WolfThemes/WordPress use accent fonts; "engineering" the pixel font).
const wordClass = (word) => {
	if (word.includes('WordPress')) return 'wordpress';
	if (word.includes('WolfThemes')) return 'wolfthemes';
	if (word === 'engineering') return 'engineering';
	return undefined;
};

const LINE_BASE_DELAY = 0.45; // seconds; start after the main heading
const LINE_STAGGER = 0.12; // seconds between lines

// Stats counted up below the statement. `value` is the target the counter
// animates to; `decimals` keeps the display stable (e.g. 4.5), `suffix` is the
// static accent unit that never animates.
const STATS = [
	{ value: 14, decimals: 0, suffix: 'y', label: 'Professional experience' },
	{ value: 36, decimals: 0, suffix: 'k+', label: 'Installs in production' },
	{ value: 4.5, decimals: 1, suffix: '/5', label: 'Average rating (1,600+ reviews)' },
];

const COUNT_DURATION = 1400; // ms
const COUNT_START_DELAY = 700; // ms; let the statement settle first
const SHUFFLE_AFTER_STATS = 150; // ms gap after the counters land before the shuffle

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// easeOutCubic: fast start, gentle landing.
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
				{/* Reserve the final value's width so the digit count growing
				    (e.g. 0 -> 14) can't shift the suffix during the count-up. */}
				<span
					className={cx('stat-num')}
					style={{ minWidth: `${value.toFixed(decimals).length}ch` }}
				>
					{display}
				</span>
				<span className={cx('stat-suffix')}>{suffix}</span>
			</span>
			<span className={cx('stat-label')}>{label}</span>
		</div>
	);
}

export default function HomeHero() {
	const statsRef = useRef(null);
	const [statsDone, setStatsDone] = useState(false);
	const introWords = useMemo(
		() =>
			INTRO.split(/\s+/).map((text) => {
				const classKey = wordClass(text);
				return {
					text,
					classKey,
					className: classKey ? cx(classKey) : undefined,
				};
			}),
		[]
	);

	const renderIntroWord = (word) => {
		if (word.classKey === 'engineering') {
			return (
				<span className={cx('engineering')}>
					<ShuffleText text={word.text} play={statsDone} />
				</span>
			);
		}

		if (word.classKey) {
			return <span className={cx(word.classKey)}>{word.text}</span>;
		}

		return word.text;
	};

	// Hold the hero "engineering" shuffle until the stat counters have finished.
	// Mirror the counters' own trigger (the stats row entering view) and their
	// total run time, so the shuffle lands just after the numbers settle.
	useEffect(() => {
		const node = statsRef.current;
		if (!node) return undefined;

		if (prefersReducedMotion()) {
			setStatsDone(true);
			return undefined;
		}

		let doneTimer;
		const observer = new IntersectionObserver(
			([entry], obs) => {
				if (entry.isIntersecting) {
					obs.disconnect();
					doneTimer = setTimeout(
						() => setStatsDone(true),
						COUNT_START_DELAY + COUNT_DURATION + SHUFFLE_AFTER_STATS
					);
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe(node);

		return () => {
			observer.disconnect();
			if (doneTimer) clearTimeout(doneTimer);
		};
	}, []);

	return (
		<section id="home" className={cx('component')}>
			<h1 className={cx('title')}>
				Senior{' '}
				<span className={cx('circled')}>
					Web
					{/* <HeroCircle /> disabled for now */}
				</span>{' '}
				Engineer
			</h1>
			<div className={cx('bottom')}>
				<div className={cx('bottom-left')}>
					<p className={cx('intro')}>
						<SplitLines
							words={introWords}
							renderWord={renderIntroWord}
							lineClassName={cx('line')}
							baseDelay={LINE_BASE_DELAY}
							stagger={LINE_STAGGER}
						/>
					</p>

					<div className={cx('cta')}>
						<a className={cx('cta-button')} href="mailto:constantin@saguin.com">
							<span className={cx('cta-label')}>Let&apos;s connect</span>
							<svg
								className={cx('cta-arrow')}
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M3.5 8h9M8.5 4l4 4-4 4"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</a>
					</div>
				</div>

				<div className={cx('stats')} ref={statsRef}>
					{STATS.map((stat) => (
						<Stat key={stat.label} {...stat} rowRef={statsRef} />
					))}
				</div>
			</div>
		</section>
	);
}
