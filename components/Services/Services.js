import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import classNames from 'classnames/bind';
import styles from './Services.module.scss';
import { useCopy } from '../../lib/i18n';
import { scrollTo } from '../../lib/scroll';
import { track } from '../../lib/track';
import { MailIcon, QuoteIcon, RocketIcon, ShieldIcon, SlidersIcon, KeyIcon } from './icons';

let cx = classNames.bind(styles);

const STATS = [
	{ value: '15', suffix: 'y' },
	{ value: '36', suffix: 'k+' },
	{ value: '4.5', suffix: '/5' },
];

// Published Upwork testimonials; the non-original language is a translation.
const TESTIMONIALS = [
	{
		author: 'Jean-François W.',
		role: { en: 'Wine Merchant', fr: 'Négociant en vins' },
		quote: {
			en: 'Constantin has developed our wine e-commerce website and has followed our brief properly: the site has an elegant design corresponding with our brand, has no problems in the checkout process, and boasts a product catalog manageable from our side. He evidently possesses expertise in WooCommerce and pays attention to things like performance and mobile experience, which are very critical for e-commerce. He was very responsive throughout the project and delivered what we expected.',
			fr: "Constantin a développé notre site e-commerce de vin en suivant correctement notre brief : le site a un design élégant, fidèle à notre marque, aucun problème dans le processus de paiement, et un catalogue produits que nous pouvons gérer nous-mêmes. Il maîtrise manifestement WooCommerce et prête attention à la performance et à l'expérience mobile, deux points essentiels pour l'e-commerce. Il s'est montré très réactif tout au long du projet et a livré ce que nous attendions.",
		},
	},
	{
		author: 'Edward S.',
		role: {
			en: 'Musician, Filmmaker & Creative Producer',
			fr: 'Musicien, réalisateur & producteur créatif',
		},
		quote: {
			en: 'My company, Ton-Up, Inc., has exclusively used WordPress themes designed by Constantin on all of our websites since 2016. The design aesthetic and quality of his themes are exceptional, creating a compelling web presence that delivers results. Constantin is great to work with; He is reliable, responsive, and goes above and beyond to help. I highly recommend him.',
			fr: "Mon entreprise, Ton-Up, Inc., utilise exclusivement des thèmes WordPress conçus par Constantin sur tous nos sites depuis 2016. L'esthétique et la qualité de ses thèmes sont exceptionnelles et donnent une présence web convaincante qui produit des résultats. Constantin est un plaisir à côtoyer : il est fiable, réactif et va toujours au-delà pour aider. Je le recommande vivement.",
		},
	},
	{
		author: 'Solène L.',
		role: {
			en: 'Art Direction / Graphic Design / Communication',
			fr: 'Direction artistique / Graphisme / Communication',
		},
		quote: {
			en: 'Constantin helped me a lot with my WordPress theme. He was always very responsive, patient and available. Whenever I ran into a problem, he took the time to look for a solution and explain things clearly. I recommend him without hesitation to anyone looking for a reliable WordPress developer!',
			fr: "Constantin m'a beaucoup aidée sur mon thème WordPress. Il a toujours été très réactif, patient et disponible. À chaque problème rencontré, il prenait le temps de chercher une solution et de m'expliquer les choses clairement. Je le recommande sans hésiter à toute personne qui cherche un développeur WordPress fiable !",
		},
	},
	{
		author: 'Naomi M.',
		role: { en: 'Professional Voice Actor', fr: 'Comédienne voix professionnelle' },
		quote: {
			en: "I loved working with Constantin! He was knowledgeable and had great customer service. Not only did he handle all of my requests with ease, he was also really responsive to any emails. I'd hire him again in a heartbeat. Highly recommended!",
			fr: "J'ai adoré travailler avec Constantin ! Il est compétent et très attentif à ses clients. Non seulement il a traité toutes mes demandes sans difficulté, mais il répondait aussi très vite à chaque e-mail. Je referais appel à lui sans hésiter. Vivement recommandé !",
		},
	},
];

const STEP_ICONS = [MailIcon, QuoteIcon, RocketIcon];
const REASSURE_ICONS = [ShieldIcon, SlidersIcon, KeyIcon];

// CTAs open the contact form with the topic pre-filled.
const contactHref = (topic) => ({ pathname: '/contact', query: { topic, for: 'client' } });

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
// pre-filled contact form link), process, differentiators, FAQ, closing CTA. No video
// backdrop; sections fade up once on scroll (CSS handles reduced motion).
export default function Services() {
	const { services: c } = useCopy();
	const lang = useRouter().locale === 'fr' ? 'fr' : 'en';
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
				<p className={cx('audience')}>{c.audience}</p>
				<div className={cx('actions')}>
					<Link
						className={cx('primary')}
						href={contactHref(c.hero.subject)}
						onClick={() => track('cta_click', { location: 'services_hero' })}
					>
						<span>{c.hero.cta}</span>
						<Arrow />
					</Link>
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
								{item.tech && (
									<div className={cx('tech')}>
										<span className={cx('tech-label')}>{c.offers.under}</span>
										<ul className={cx('tags')}>
											{item.tech.split(', ').map((tag) => (
												<li key={tag}>{tag}</li>
											))}
										</ul>
									</div>
								)}
							</div>
							<div className={cx('offer-side')}>
								{item.price ? (
									<p className={cx('price')}>
										<span className={cx('price-from')}>{c.offers.from}</span> {item.price}
									</p>
								) : (
									<p className={cx('price', 'price-free')}>{c.offers.free}</p>
								)}
								<Link
									className={cx('ghost')}
									href={contactHref(`${c.offers.subject} — ${item.title}`)}
									onClick={() => track('offer_click', { offer: item.title })}
								>
									<span>{item.cta ?? c.offers.cta}</span>
									<Arrow />
								</Link>
							</div>
						</li>
					))}
				</ul>
			</section>

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.proof.eyebrow}</p>
				<h2 className={cx('title')}>{c.proof.title}</h2>
				<ul className={cx('grid', 'quotes')}>
					{TESTIMONIALS.map((t) => (
						<li key={t.author}>
							<figure className={cx('testimonial')}>
								<blockquote className={cx('quote')}>“{t.quote[lang]}”</blockquote>
								<figcaption className={cx('quote-caption')}>
									<span className={cx('avatar')} aria-hidden="true">
										{t.author[0]}
									</span>
									<span>
										<span className={cx('quote-author')}>{t.author}</span>
										{t.role && <span className={cx('quote-role')}>{t.role[lang]}</span>}
									</span>
								</figcaption>
							</figure>
						</li>
					))}
				</ul>
			</section>

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.process.eyebrow}</p>
				<h2 className={cx('title')}>{c.process.title}</h2>
				<ol className={cx('stepper')}>
					{c.process.steps.map(([title, text], i) => {
						const Icon = STEP_ICONS[i];
						return (
							<li key={title} className={cx('step')}>
								<span className={cx('step-node')}>
									<Icon />
								</span>
								<span className={cx('step-index')}>{String(i + 1).padStart(2, '0')}</span>
								<h3 className={cx('item-title')}>{title}</h3>
								<p className={cx('item-text')}>{text}</p>
							</li>
						);
					})}
				</ol>
			</section>

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.reassure.eyebrow}</p>
				<h2 className={cx('title')}>{c.reassure.title}</h2>
				<ul className={cx('cards')}>
					{c.reassure.items.map(([title, text], i) => {
						const Icon = REASSURE_ICONS[i];
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

			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.why.eyebrow}</p>
				<h2 className={cx('title')}>{c.why.title}</h2>
				<dl className={cx('spec')}>
					{c.why.items.map(([title, text]) => (
						<div key={title} className={cx('spec-row')}>
							<dt>{title}</dt>
							<dd>{text}</dd>
						</div>
					))}
				</dl>
			</section>

			<section className={cx('section', 'faq-section')} data-reveal>
				<div className={cx('faq-head')}>
					<p className={cx('eyebrow')}>{c.faq.eyebrow}</p>
					<h2 className={cx('title')}>{c.faq.title}</h2>
				</div>
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
					<Link
						className={cx('primary')}
						href={contactHref(c.final.subject)}
						onClick={() => track('cta_click', { location: 'services_final' })}
					>
						<span>{c.final.cta}</span>
						<Arrow />
					</Link>
				</div>
				<p className={cx('note')}>
					{c.final.hire}{' '}
					<Link
						className={cx('email')}
						href="/engineering"
						onClick={() =>
							track('cta_click', { location: 'services_final', target: 'engineering' })
						}
					>
						{c.final.hireCta} →
					</Link>
				</p>
			</section>
		</div>
	);
}
