import { useEffect, useRef } from 'react';
import Link from 'next/link';
import classNames from 'classnames/bind';
import styles from './Engineering.module.scss';
import { Playground } from '../Playground';
import { useCopy } from '../../lib/i18n';
import { track } from '../../lib/track';

let cx = classNames.bind(styles);

const STATS = [
	{ value: '15', suffix: 'y' },
	{ value: '36', suffix: 'k+' },
	{ value: '4.5', suffix: '/5' },
];

const contactHref = (topic) => ({ pathname: '/contact', query: { topic } });

// Recruiter / tech-lead page: the technical proof that would be noise on the
// client-facing pages. Sections fade up once on scroll (CSS handles reduced motion).
export default function Engineering() {
	const { engineering: c, cv } = useCopy();
	const rootRef = useRef(null);

	useEffect(() => {
		const nodes = rootRef.current?.querySelectorAll('[data-reveal]') ?? [];
		const io = new IntersectionObserver(
			(entries) =>
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add(styles['is-in']);
					io.unobserve(entry.target);
				}),
			{ threshold: 0.12 }
		);
		nodes.forEach((node) => io.observe(node));
		return () => io.disconnect();
	}, []);

	return (
		<div ref={rootRef} className={cx('component')}>
			<section className={cx('hero')}>
				<p className={cx('eyebrow')}>{c.hero.eyebrow}</p>
				<h1 className={cx('hero-title')}>{c.hero.title}</h1>
				<p className={cx('hero-lead')}>{c.hero.lead}</p>
				<div className={cx('actions')}>
					<a
						className={cx('primary')}
						href={cv}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => track('cv_download', { location: 'engineering' })}
					>
						{c.hero.cta}
					</a>
					<Link
						className={cx('secondary')}
						href={contactHref(c.hero.topic)}
						onClick={() => track('cta_click', { location: 'engineering_hero', target: 'hiring' })}
					>
						{c.hero.contact} →
					</Link>
				</div>
				<p className={cx('note')}>{c.hero.note}</p>
				<div className={cx('stats')}>
					{STATS.map((stat, i) => (
						<div key={i} className={cx('stat')}>
							<span className={cx('stat-value')}>
								{stat.value}
								<span className={cx('stat-suffix')}>{stat.suffix}</span>
							</span>
							<span className={cx('stat-label')}>{c.stats[i]}</span>
						</div>
					))}
				</div>
			</section>

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.principles.eyebrow}</p>
				<h2 className={cx('title')}>{c.principles.title}</h2>
				<ul className={cx('grid')}>
					{c.principles.items.map(([title, text]) => (
						<li key={title}>
							<h3 className={cx('item-title')}>{title}</h3>
							<p className={cx('item-text')}>{text}</p>
						</li>
					))}
				</ul>
			</section>

			<Playground />

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.roles.eyebrow}</p>
				<h2 className={cx('title')}>{c.roles.title}</h2>
				<ul className={cx('roles')}>
					{c.roles.items.map((role) => (
						<li key={role}>{role}</li>
					))}
				</ul>
			</section>

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.architecture.eyebrow}</p>
				<h2 className={cx('title')}>{c.architecture.title}</h2>
				<p className={cx('lead')}>{c.architecture.text}</p>
			</section>

			<section className={cx('section', 'final')} data-reveal>
				<h2 className={cx('title')}>{c.final.title}</h2>
				<p className={cx('lead')}>{c.final.lead}</p>
				<div className={cx('actions')}>
					<Link
						className={cx('primary')}
						href={contactHref(c.hero.topic)}
						onClick={() => track('cta_click', { location: 'engineering_final', target: 'hiring' })}
					>
						{c.final.cta}
					</Link>
				</div>
				<p className={cx('note')}>
					{c.final.client}{' '}
					<Link
						className={cx('link')}
						href="/services"
						onClick={() => track('cta_click', { location: 'engineering_final', target: 'services' })}
					>
						{c.final.clientCta}
					</Link>
				</p>
			</section>
		</div>
	);
}
