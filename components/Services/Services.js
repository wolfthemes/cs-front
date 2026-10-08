import { useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Services.module.scss';
import { useCopy } from '../../lib/i18n';
import { scrollTo } from '../../lib/scroll';

let cx = classNames.bind(styles);

const EMAIL = 'constantin@saguin.com';
const STATS = [
	{ value: '15', suffix: 'y' },
	{ value: '36', suffix: 'k+' },
	{ value: '4.5', suffix: '/5' },
];

const mailto = (subject) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

function Arrow() {
	return (
		<svg
			className={cx('arrow')}
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
	);
}

// Conversion landing page: hero + proof, priced offers (each with its own
// pre-filled mailto), process, differentiators, FAQ, closing CTA. No video
// backdrop; sections fade up once on scroll (CSS handles reduced motion).
export default function Services() {
	const { services: c, hero } = useCopy();
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

	const goToOffers = (event) => {
		const target = document.getElementById('offers');
		if (!target) return;
		event.preventDefault();
		scrollTo(target);
	};

	return (
		<div ref={rootRef} className={cx('component')}>
			<section id="services" className={cx('hero')}>
				<p className={cx('eyebrow')}>{c.hero.eyebrow}</p>
				<h1 className={cx('hero-title')}>{c.hero.title}</h1>
				<p className={cx('hero-lead')}>{c.hero.lead}</p>
				<div className={cx('actions')}>
					<a className={cx('primary')} href={mailto(c.hero.subject)}>
						<span>{c.hero.cta}</span>
						<Arrow />
					</a>
					<a className={cx('secondary')} href="#offers" onClick={goToOffers}>
						{c.hero.secondary} ↓
					</a>
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

			<section id="offers" className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.offers.eyebrow}</p>
				<h2 className={cx('title')}>{c.offers.title}</h2>
				<p className={cx('lead')}>{c.offers.lead}</p>
				<ul className={cx('offers')}>
					{c.offers.items.map((item, i) => (
						<li key={item.title} className={cx('offer')}>
							<span className={cx('offer-index')}>{String(i + 1).padStart(2, '0')}</span>
							<div className={cx('offer-main')}>
								<h3 className={cx('offer-title')}>{item.title}</h3>
								<p className={cx('offer-text')}>{item.text}</p>
								<ul className={cx('points')}>
									{item.points.map((point) => (
										<li key={point}>{point}</li>
									))}
								</ul>
							</div>
							<div className={cx('offer-side')}>
								<p className={cx('price')}>
									<span className={cx('price-from')}>{c.offers.from}</span> {item.price}
								</p>
								<a className={cx('ghost')} href={mailto(`${c.offers.subject} — ${item.title}`)}>
									<span>{c.offers.cta}</span>
									<Arrow />
								</a>
							</div>
						</li>
					))}
				</ul>
			</section>

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.process.eyebrow}</p>
				<h2 className={cx('title')}>{c.process.title}</h2>
				<ol className={cx('grid', 'steps')}>
					{c.process.steps.map(([title, text], i) => (
						<li key={title}>
							<span className={cx('step-index')}>{String(i + 1).padStart(2, '0')}</span>
							<h3 className={cx('item-title')}>{title}</h3>
							<p className={cx('item-text')}>{text}</p>
						</li>
					))}
				</ol>
			</section>

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.why.eyebrow}</p>
				<h2 className={cx('title')}>{c.why.title}</h2>
				<ul className={cx('grid', 'why')}>
					{c.why.items.map(([title, text]) => (
						<li key={title}>
							<h3 className={cx('item-title')}>{title}</h3>
							<p className={cx('item-text')}>{text}</p>
						</li>
					))}
				</ul>
			</section>

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.faq.eyebrow}</p>
				<h2 className={cx('title')}>{c.faq.title}</h2>
				<div className={cx('faq')}>
					{c.faq.items.map(([question, answer]) => (
						<details key={question} className={cx('faq-item')}>
							<summary>{question}</summary>
							<p>{answer}</p>
						</details>
					))}
				</div>
			</section>

			<section id="contact" className={cx('section', 'final')} data-reveal>
				<p className={cx('eyebrow')}>{c.final.eyebrow}</p>
				<h2 className={cx('final-title')}>{c.final.title}</h2>
				<p className={cx('lead')}>{c.final.lead}</p>
				<div className={cx('actions')}>
					<a className={cx('primary')} href={mailto(c.final.subject)}>
						<span>{c.final.cta}</span>
						<Arrow />
					</a>
					<a className={cx('email')} href={`mailto:${EMAIL}`}>
						{EMAIL}
					</a>
				</div>
			</section>
		</div>
	);
}
