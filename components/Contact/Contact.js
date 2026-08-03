import React, { useEffect, useRef, useState } from 'react';
import className from 'classnames/bind';
import styles from './Contact.module.scss';

let cx = className.bind(styles);

const EMAIL = 'constantin@saguin.com';

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Closing contact / availability CTA — terminal-styled to match the header
// brand and hero. Signals freelance + full-time remote availability and is
// recruiter-friendly. Content reveals once scrolled into view.
export default function Contact() {
	const ref = useRef(null);
	const [visible, setVisible] = useState(false);

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
			{ threshold: 0.25 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<section
			ref={ref}
			className={cx('component', { 'is-visible': visible })}
			aria-labelledby="contact-title"
		>
			<div className={cx('inner')}>
				<div className={cx('topbar')}>
					<span className={cx('label')}>
						<span className={cx('label-accent')}>~/</span>contact
					</span>
					<span className={cx('prompt')}>
						<span className={cx('prompt-accent')}>$</span> whoami{' '}
						<span className={cx('prompt-accent')}>--hire</span>
					</span>
				</div>

				<h2 id="contact-title" className={cx('title')}>
					Let&apos;s build something worth shipping.
				</h2>

				<p className={cx('lead')}>
					Open to senior full-time remote roles and select freelance or contract work. Based in
					France (CEST) and comfortable across EU and US time zones — recruiters, feel free to reach
					out.
				</p>

				<div className={cx('actions')}>
					<a className={cx('primary')} href={`mailto:${EMAIL}`}>
						Get in touch
					</a>
					<a className={cx('email')} href={`mailto:${EMAIL}`}>
						{EMAIL}
					</a>
				</div>
			</div>
		</section>
	);
}
