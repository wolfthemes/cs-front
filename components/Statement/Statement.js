import React, { useEffect, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './Statement.module.scss';
import { Signature } from '../../components';

let cx = className.bind(styles);

// Placeholder copy. The big headline reveals line-by-line as it enters view; the
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
function RevealParagraph({
	as: Tag = 'p',
	text,
	className: cls,
	startIndex = 0,
	onMeasured,
}) {
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
		<Tag ref={ref} className={cx(cls)}>
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
		</Tag>
	);
}

export default function Statement() {
	// Line count of the first paragraph, so the second continues the cascade.
	const [leadLineCount, setLeadLineCount] = useState(0);
	const handleLeadMeasured = (count) => {
		setLeadLineCount((current) => (current === count ? current : count));
	};

	return (
		<section id="about" className={cx('component')}>
			<p className={cx('eyebrow')}>~/about</p>
			<RevealParagraph as="h2" text={HEADLINE} className="headline" />

			<div className={cx('body')}>
				<RevealParagraph text={LEAD} className="lead" onMeasured={handleLeadMeasured} />
				<RevealParagraph text={SUPPORT} className="support" startIndex={leadLineCount} />
			</div>

			<Signature className={cx('signature')} />
		</section>
	);
}
