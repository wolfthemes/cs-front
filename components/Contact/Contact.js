import React, { useEffect, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './Contact.module.scss';

let cx = className.bind(styles);

const EMAIL = 'constantin@saguin.com';
const TITLE = "Let's build something worth shipping.";

// Reveal timing (seconds). The title reveals line by line; the lead follows the
// last line and the button lands last.
const TITLE_BASE_DELAY = 0.12; // before the first title line (after the eyebrow)
const TITLE_LINE_STAGGER = 0.1; // between title lines
const AFTER_TITLE_GAP = 0.06; // lead, just after the last line
const BUTTON_GAP = 0.16; // button, last of all

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Split `text` into its real wrapped lines, measured against the element's live
// width by laying the words out in a hidden clone and grouping them by their top
// offset (same technique as the Statement reveal).
function measureLines(el, text) {
	const temp = document.createElement(el.tagName);
	temp.className = el.className;
	temp.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;';
	temp.style.width = `${el.clientWidth}px`;
	const words = text.split(' ');
	temp.innerHTML = words
		.map((w) => `<span style="display:inline-block">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`)
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

	return groups.map((g) => g.join(' '));
}

// Closing contact / availability CTA — terminal-styled to match the header
// brand and hero. Signals freelance + full-time remote availability and is
// recruiter-friendly. Content reveals once scrolled into view.
export default function Contact() {
	const ref = useRef(null);
	const titleRef = useRef(null);
	const [visible, setVisible] = useState(false);
	const [lines, setLines] = useState(null);

	// Measure the title's wrapped lines up front so they can reveal one by one.
	useEffect(() => {
		const el = titleRef.current;
		if (!el) return undefined;
		if (prefersReducedMotion()) {
			setLines([TITLE]);
			return undefined;
		}
		setLines(measureLines(el, TITLE));
		return undefined;
	}, []);

	useEffect(() => {
		const node = ref.current;
		if (!node) return undefined;

		if (prefersReducedMotion()) {
			setVisible(true);
			return undefined;
		}

		const observer = new IntersectionObserver(
			([entry], obs) => {
				if (entry.isIntersecting) {
					setVisible(true);
					obs.disconnect();
				}
			},
			// Hold the reveal back until the section is well into view — fire when
			// its top has scrolled up past the lower third of the viewport, so the
			// copy doesn't start animating while it's still near the bottom edge.
			{ threshold: 0, rootMargin: '0px 0px -32% 0px' }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const titleLines = lines ?? [TITLE];
	const leadDelay = TITLE_BASE_DELAY + titleLines.length * TITLE_LINE_STAGGER + AFTER_TITLE_GAP;
	const actionsDelay = leadDelay + BUTTON_GAP;

	return (
		<section
			id="contact"
			ref={ref}
			className={cx('component', { 'is-visible': visible })}
			aria-labelledby="contact-title"
		>
			<div className={cx('inner')}>
				<div className={cx('topbar', 'reveal')} style={{ transitionDelay: '0s' }}>
					<span className={cx('eyebrow')}>~/contact</span>
				</div>

				<h2 id="contact-title" ref={titleRef} className={cx('title')}>
					{lines
						? lines.map((line, i) => (
								<span
									key={i}
									className={cx('title-line', 'reveal')}
									style={{ transitionDelay: `${TITLE_BASE_DELAY + i * TITLE_LINE_STAGGER}s` }}
								>
									{line}
								</span>
						  ))
						: TITLE}
				</h2>

				<p className={cx('lead', 'reveal')} style={{ transitionDelay: `${leadDelay}s` }}>
					Senior full-time remote roles and select contract work. Based in France (CEST), working
					across EU and US time zones.
				</p>

				<div
					className={cx('actions', 'reveal')}
					style={{ transitionDelay: `${actionsDelay}s` }}
				>
					<a className={cx('primary')} href={`mailto:${EMAIL}`}>
						<span className={cx('primary-label')}>Get in touch</span>
						<svg
							className={cx('primary-arrow')}
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
		</section>
	);
}
