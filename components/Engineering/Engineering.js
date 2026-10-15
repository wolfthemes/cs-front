import { useEffect, useRef } from 'react';
import Link from 'next/link';
import classNames from 'classnames/bind';
import styles from './Engineering.module.scss';
import { Playground } from '../Playground';
import { StatBand } from '../StatBand';
import { LayersIcon, GaugeIcon, PipelineIcon, PackageIcon, ArrowIcon } from './icons';
import { useCopy } from '../../lib/i18n';
import { track } from '../../lib/track';

let cx = classNames.bind(styles);

const PRINCIPLE_ICONS = [LayersIcon, GaugeIcon, PipelineIcon, PackageIcon];
const contactHref = (topic) => ({ pathname: '/contact', query: { topic, for: 'team' } });

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
				<div className={cx('hero-main')}>
					<p className={cx('eyebrow')}>{c.hero.eyebrow}</p>
					<h1 className={cx('hero-title')}>
						{c.hero.title.map((line) => (
							<span key={line} className={cx('hero-title-line')}>
								{line}
							</span>
						))}
					</h1>
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
				</div>

				<aside className={cx('panel')} aria-label={c.availability.status}>
					<p className={cx('status')}>
						<span className={cx('dot')} aria-hidden="true" />
						{c.availability.status}
					</p>
					<dl className={cx('facts')}>
						{c.availability.rows.map(([label, value]) => (
							<div key={label} className={cx('fact')}>
								<dt>{label}</dt>
								<dd>{value}</dd>
							</div>
						))}
					</dl>
				</aside>
			</section>

			<div className={cx('inset')}>
				<StatBand labels={c.stats} compact />
			</div>

			<section className={cx('section', 'solid')} data-reveal>
				<p className={cx('eyebrow')}>{c.principles.eyebrow}</p>
				<h2 className={cx('title')}>{c.principles.title}</h2>
				<ul className={cx('cards')}>
					{c.principles.items.map(([title, text], i) => {
						const Icon = PRINCIPLE_ICONS[i];
						return (
							<li key={title} className={cx('card')}>
								<span className={cx('card-icon')}>
									<Icon />
								</span>
								<h3 className={cx('item-title')}>{title}</h3>
								<p className={cx('item-text')}>{text}</p>
							</li>
						);
					})}
				</ul>
			</section>

			<Playground />

			<section className={cx('section', 'solid')} data-reveal>
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
				<ol className={cx('flow')}>
					{c.architecture.flow.map(([name, role]) => (
						<li key={name} className={cx('flow-node')}>
							<span className={cx('flow-name')}>{name}</span>
							<span className={cx('flow-role')}>{role}</span>
						</li>
					))}
				</ol>
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
						<span>{c.final.cta}</span>
						<ArrowIcon className={cx('arrow')} />
					</Link>
				</div>
				<p className={cx('note')}>
					{c.final.client}{' '}
					<Link
						className={cx('link')}
						href="/services"
						onClick={() =>
							track('cta_click', { location: 'engineering_final', target: 'services' })
						}
					>
						{c.final.clientCta}
					</Link>
				</p>
			</section>
		</div>
	);
}
