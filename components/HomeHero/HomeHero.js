import React, { useEffect, useMemo, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './HomeHero.module.scss';
// import HeroCircle from './HeroCircle'; // ellipse disabled for now
import Link from 'next/link';
import { ShuffleText, SplitLines } from '../../components';
import { useCopy } from '../../lib/i18n';
import { track } from '../../lib/track';

let cx = className.bind(styles);

// Words carry the class of any styled term (WolfThemes/WordPress use accent
// fonts; "engineering" the pixel font).
const wordClass = (word, shuffle) => {
	if (word.includes('WordPress')) return 'wordpress';
	if (word.includes('WolfThemes')) return 'wolfthemes';
	if (word === shuffle) return 'engineering';
	return undefined;
};

const LINE_BASE_DELAY = 0.45; // seconds; start after the main heading
const LINE_STAGGER = 0.12; // seconds between lines

// Stats counted up below the statement. `value` is the target the counter
// animates to; `decimals` keeps the display stable (e.g. 4.5), `suffix` is the
// static accent unit that never animates.
const STATS = [
	{ value: 15, decimals: 0, suffix: 'y', label: 0 },
	{ value: 36, decimals: 0, suffix: 'k+', label: 1 },
	{ value: 4.5, decimals: 1, suffix: '/5', label: 2 },
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

// Count a single number from 0 to `value` once `started` flips true (driven by a
// single shared observer in HomeHero, so the three stats don't each watch the row).
function useCountUp(value, decimals, started) {
	const [display, setDisplay] = useState(value); // real value for SSR / no-JS / crawlers

	useEffect(() => {
		if (prefersReducedMotion()) {
			setDisplay(value);
			return undefined;
		}
		if (!started) {
			setDisplay(0);
			return undefined;
		}

		let rafId;
		let startTs;

		const step = (ts) => {
			if (startTs === undefined) startTs = ts;
			const progress = Math.min((ts - startTs) / COUNT_DURATION, 1);
			setDisplay(value * easeOut(progress));
			if (progress < 1) rafId = requestAnimationFrame(step);
		};

		const delayTimer = setTimeout(() => {
			rafId = requestAnimationFrame(step);
		}, COUNT_START_DELAY);

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			clearTimeout(delayTimer);
		};
	}, [value, started]);

	return display.toFixed(decimals);
}

function Stat({ value, decimals, suffix, label, started }) {
	const display = useCountUp(value, decimals, started);
	return (
		<div className={cx('stat')}>
			<span className={cx('stat-value')}>
				{/* The invisible ghost holds the final value's exact width so the digit
				    count growing (e.g. 0 -> 15) can't shift the suffix mid count-up. */}
				<span className={cx('stat-num')}>
					<span className={cx('stat-num-ghost')} aria-hidden="true">
						{value.toFixed(decimals)}
					</span>
					<span>{display}</span>
				</span>
				<span className={cx('stat-suffix')}>{suffix}</span>
			</span>
			<span className={cx('stat-label')}>{label}</span>
		</div>
	);
}

export default function HomeHero() {
	const { hero } = useCopy();
	const statsRef = useRef(null);
	// One observer for the whole stats row: `started` triggers all three counters,
	// `statsDone` (below) gates the "engineering" shuffle after they land.
	const [started, setStarted] = useState(false);
	const [statsDone, setStatsDone] = useState(false);
	// One flowing paragraph: SplitLines measures the browser's real line breaks, so
	// wrapping adapts to any width instead of following hand-split lines.
	const introWords = useMemo(() => {
		const tokens = hero.intro.split(/\s+/);
		const phrase = hero.shuffle.split(/\s+/);
		const words = [];
		for (let i = 0; i < tokens.length; i += 1) {
			// A multi-word shuffle target (e.g. "sites web") is kept as one unit.
			const isPhrase = phrase.length > 1 && phrase.every((part, k) => tokens[i + k] === part);
			const text = isPhrase ? phrase.join(' ') : tokens[i];
			if (isPhrase) i += phrase.length - 1;
			const classKey = wordClass(text, hero.shuffle);
			words.push({ text, classKey, className: classKey && cx(classKey) });
		}
		return words;
	}, [hero]);

	const renderIntroWord = (word) => {
		if (word.classKey === 'engineering') {
			return (
				<span className={cx('engineering')}>
					<ShuffleText text={word.text} play={statsDone} />
				</span>
			);
		}

		if (word.classKey === 'wolfthemes') {
			// Link the name only; trailing punctuation stays outside the anchor.
			const [, name, punct] = word.text.match(/^(.*?)([,.;:]*)$/);
			return (
				<>
					<a
						className={cx('wolfthemes')}
						href="https://wolfthemes.com"
						target="_blank"
						rel="noopener"
						onClick={() => track('cta_click', { location: 'hero', target: 'wolfthemes' })}
					>
						{name}
					</a>
					{punct}
				</>
			);
		}

		if (word.classKey) {
			return <span className={cx(word.classKey)}>{word.text}</span>;
		}

		return word.text;
	};

	// Single shared observer: flip `started` once the stats row enters view. The
	// three counters and the shuffle gate below both key off this one signal
	// instead of each attaching their own observer to the same node.
	useEffect(() => {
		const node = statsRef.current;
		if (!node) return undefined;

		if (prefersReducedMotion()) {
			setStarted(true);
			return undefined;
		}

		const observer = new IntersectionObserver(
			([entry], obs) => {
				if (entry.isIntersecting) {
					obs.disconnect();
					setStarted(true);
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	// Hold the hero "engineering" shuffle until the counters have finished: once
	// `started` flips, wait their delay + run time so the shuffle lands just after
	// the numbers settle. Reduced motion resolves immediately (no count-up).
	useEffect(() => {
		if (prefersReducedMotion()) {
			setStatsDone(true);
			return undefined;
		}
		if (!started) return undefined;

		const doneTimer = setTimeout(
			() => setStatsDone(true),
			COUNT_START_DELAY + COUNT_DURATION + SHUFFLE_AFTER_STATS
		);
		return () => clearTimeout(doneTimer);
	}, [started]);

	return (
		<section id="home" className={cx('component')}>
			<div className={cx('top')}>
				<h1 className={cx('title')}>
					{hero.title[0]}
					<span className={cx('circled')}>
						{hero.title[1]}
						{/* <HeroCircle /> disabled for now */}
					</span>
					{hero.title[2]}
				</h1>
				<p className={cx('intro')}>
					<SplitLines
						words={introWords}
						renderWord={renderIntroWord}
						lineClassName={cx('line')}
						baseDelay={LINE_BASE_DELAY}
						stagger={LINE_STAGGER}
					/>
				</p>
			</div>
			<div className={cx('bottom')}>
				<div className={cx('bottom-left')}>
					<div className={cx('cta')}>
						<Link
							className={cx('cta-button')}
							href="/services"
							onClick={() => track('cta_click', { location: 'hero', target: 'services' })}
						>
							<span className={cx('cta-label')}>{hero.cta}</span>
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
						</Link>
						<Link
							className={cx('cta-button', 'cta-secondary')}
							href="/engineering"
							onClick={() => track('cta_click', { location: 'hero', target: 'engineering' })}
						>
							<span className={cx('cta-label')}>{hero.pro}</span>
						</Link>
					</div>
				</div>

				<div className={cx('stats')} ref={statsRef}>
					{STATS.map((stat, i) => (
						<Stat key={i} {...stat} label={hero.stats[stat.label]} started={started} />
					))}
				</div>
			</div>
		</section>
	);
}
