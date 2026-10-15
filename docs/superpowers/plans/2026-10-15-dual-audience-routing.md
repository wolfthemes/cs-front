# Dual-audience routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the site cleanly between end-clients (`/`, `/services`) and recruiters/tech leads (new `/engineering`) without removing existing content.

**Architecture:** `/engineering` is a static Next page like `pages/services.js` (WP query only feeds the footer). All copy lives in `lib/i18n.js` (EN + FR). A new `Paths` component on the home page splits visitors; the stack grid (`Playground`) moves from home to `/engineering`; `/services` copy is rewritten client-first.

**Tech Stack:** Next.js Pages Router (Faust.js), CSS Modules + `classnames/bind` (SCSS, tabs), Apollo, no test suite.

**Spec:** `docs/superpowers/specs/2026-10-15-dual-audience-routing-design.md`

## Global Constraints

- Component = folder `Name/Name.js` + `Name.module.scss` + `index.js`; export from `components/index.js`; import from `'../components'`.
- Tab indentation in JS/SCSS; SCSS uses `@import 'tokens'`/`'breakpoints'`, `$c-*`, `fs()`, `fw()`.
- Every user-facing string exists in both `COPY.en` and `COPY.fr` in `lib/i18n.js`.
- Prices unchanged: EN $750 / $2,000 / $3,500 / $4,000; FR 700 € / 1 800 € / 3 200 € / 3 700 €.
- Analytics via `track(event, props)` from `lib/track`, same shape as existing calls.
- Animations guard `prefers-reduced-motion` (reuse the `data-reveal` + CSS pattern from Services).
- No test suite: verification = `npm run lint`, `npm run lint:styles`, `npm run build`, plus HTTP checks against `npm run dev` (port 3000).
- Case-study "client outcome" lines (spec, Homepage) need no code: cards already render the WP excerpt (`work.excerpt`). Owner edits excerpts in WordPress.
- All new EN/FR copy below is a draft for the owner's review before merge.

## Review Focus

- `/fr/engineering` must render French (locale switch keeps path): check `Header` language link on `/engineering`.
- Header nav now has 4 items: must not overflow on mobile (check the menu at 375px).
- `/engineering` direct load with no WP data (`data` undefined) must not crash: use `?.` like `pages/services.js`.
- Home hash links (`/#about`, `/#case-studies`) must still resolve after `Playground` is removed from home.
- Hero secondary CTA is now a `Link` to `/engineering`; the CV PDF must still be reachable from `/engineering` and from the Services footer note.

---

### Task 1: Copy foundation + nav entry

**Files:**
- Modify: `lib/i18n.js` (nav, hero, contact, add `paths` and `engineering` blocks, EN lines 8-20, 60-64; FR 244-255, 295-299)
- Modify: `components/Header/Header.js:14-18`

**Interfaces:**
- Produces: `useCopy().nav.engineering`, `.hero.cta/.pro`, `.paths`, `.engineering` (shape defined in Steps 2-3, consumed by Tasks 2, 3).

- [ ] **Step 1: Header nav entry.** In `components/Header/Header.js` replace the `NAV` array with:

```js
const NAV = [
	{ key: 'home', path: '/', section: 'home' },
	{ key: 'services', path: '/services', section: 'services' },
	{ key: 'engineering', path: '/engineering', section: null },
	{ key: 'contact', path: '/contact', section: null },
];
```

- [ ] **Step 2: EN nav/hero/contact.** In `COPY.en` of `lib/i18n.js`:
  - `nav: { home: 'Home', services: 'Services', contact: 'Contact' },` -> `nav: { home: 'Home', services: 'Services', engineering: 'Engineering', contact: 'Contact' },`
  - In `hero`: replace `cta: 'Freelance services',` with `cta: 'Get a free quote',` and `cv: 'Download CV',` with `pro: 'For teams & recruiters',` (the `cv` key under `hero` is removed; the top-level `cv` path stays).
  - In `contact`: replace `lead: 'Senior full-time remote roles and select contract work. Based in France (CEST), working across EU and US time zones.',` with `lead: 'A new site, a rebuild or a senior remote role: tell me what you need. Based in France (CEST), working across EU and US time zones.',`

- [ ] **Step 3: FR nav/hero/contact.** In `COPY.fr`:
  - `nav: { home: 'Accueil', services: 'Services', contact: 'Contact' },` -> `nav: { home: 'Accueil', services: 'Services', engineering: 'Ingénierie', contact: 'Contact' },`
  - `cta: 'Services freelance',` -> `cta: 'Obtenir un devis gratuit',`; `cv: 'Télécharger le CV',` -> `pro: 'Équipes & recruteurs',`
  - contact `lead:` -> `lead: "Un nouveau site, une refonte ou un poste senior en télétravail : dites-moi ce dont vous avez besoin. Basé en France (CEST), je travaille avec l'Europe et les États-Unis.",`

- [ ] **Step 4: `paths` block (EN).** Add inside `COPY.en`, after `playground`:

```js
		paths: {
			eyebrow: '~/start-here',
			title: 'How can I help?',
			items: [
				{
					title: 'I need a website',
					text: 'A new site, a rebuild or an online shop, explained in plain language with clear prices and a free quote.',
					cta: 'See services & prices',
					href: '/services',
					target: 'services',
				},
				{
					title: "I'm hiring a senior engineer",
					text: 'Stack, architecture, proof and availability for senior remote roles and technical reinforcement.',
					cta: 'See my engineering profile',
					href: '/engineering',
					target: 'engineering',
				},
			],
		},
```

- [ ] **Step 5: `paths` block (FR).** Add inside `COPY.fr`, after `playground`:

```js
		paths: {
			eyebrow: '~/par-ici',
			title: 'Comment puis-je vous aider ?',
			items: [
				{
					title: "J'ai besoin d'un site",
					text: 'Un nouveau site, une refonte ou une boutique en ligne, expliqués simplement, avec des prix clairs et un devis gratuit.',
					cta: 'Voir les services et les prix',
					href: '/services',
					target: 'services',
				},
				{
					title: 'Je recrute un ingénieur senior',
					text: 'Stack, architecture, références et disponibilité pour des postes seniors en télétravail et du renfort technique.',
					cta: 'Voir mon profil technique',
					href: '/engineering',
					target: 'engineering',
				},
			],
		},
```

- [ ] **Step 6: `engineering` block (EN).** Add inside `COPY.en`, after `paths`:

```js
		engineering: {
			seo: {
				title: 'Senior Web Engineer — Engineering Profile | Constantin Saguin',
				description:
					'Senior WordPress / Next.js engineer, founder of WolfThemes. Stack, architecture standards, proof and availability for senior remote roles and contract work. CV download.',
			},
			hero: {
				eyebrow: '~/engineering',
				title: 'Senior engineer for your team.',
				lead: 'Founder of WolfThemes. Fifteen years of production WordPress, now focused on headless and performance-critical builds. Available for senior remote roles and technical reinforcement.',
				cta: 'Download CV',
				contact: 'Discuss a role',
				topic: 'Hiring',
				note: 'Remote · CEST · EU & US time zones · Contract or full-time',
			},
			stats: ['Professional experience', 'Licenses shipped', 'Average rating (1,600+ reviews)'],
			principles: {
				eyebrow: '~/standards',
				title: 'How I build.',
				items: [
					[
						'Architecture',
						'OOP / PSR-4, Composer, WP-CLI, Bedrock-style structure. Code your next developer can maintain.',
					],
					[
						'Performance',
						'Core Web Vitals are part of the build, measured before and after, not an afterthought.',
					],
					[
						'Delivery',
						'CI/CD with GitHub Actions, Docker / WP-Env locally, previews on Vercel, documented handover.',
					],
					[
						'Product experience',
						'Commercial WordPress products shipped 36,000+ times and rated 4.5/5 across 1,600+ reviews: support, updates and compatibility at scale.',
					],
				],
			},
			roles: {
				eyebrow: '~/availability',
				title: 'Roles I am open to.',
				items: [
					'Senior / Lead WordPress or full-stack engineer (remote)',
					'Headless WordPress (Faust.js, Next.js, WPGraphQL) architecture and delivery',
					'Contract reinforcement for agencies: block themes, WooCommerce, performance audits',
				],
			},
			architecture: {
				eyebrow: '~/case-in-point',
				title: 'This site is the example.',
				text: 'A Next.js frontend (Faust.js) on Vercel, a headless WordPress backend over WPGraphQL, Apollo cache typed from the generated schema, hand-rolled animation and a WebGL background. Editors keep WordPress; visitors get a fast static-first frontend.',
			},
			final: {
				title: "Let's talk about your team.",
				lead: 'Send a few lines about the role or the project. I reply within one business day.',
				cta: 'Get in touch',
				client: 'Need a website instead?',
				clientCta: 'See services & prices',
			},
		},
```

- [ ] **Step 7: `engineering` block (FR).** Add inside `COPY.fr`, after `paths`:

```js
		engineering: {
			seo: {
				title: 'Ingénieur Web Senior — Profil technique | Constantin Saguin',
				description:
					"Ingénieur WordPress / Next.js senior, fondateur de WolfThemes. Stack, standards d'architecture, références et disponibilité pour postes seniors en télétravail et missions. CV à télécharger.",
			},
			hero: {
				eyebrow: '~/ingénierie',
				title: 'Ingénieur senior pour votre équipe.',
				lead: "Fondateur de WolfThemes. Quinze ans de WordPress en production, aujourd'hui centré sur le headless et les projets où la performance compte. Disponible pour des postes seniors en télétravail et du renfort technique.",
				cta: 'Télécharger le CV',
				contact: 'Discuter d’un poste',
				topic: 'Recrutement',
				note: 'À distance · CEST · fuseaux horaires UE & US · Mission ou CDI',
			},
			stats: ["Années d'expérience", 'Licences livrées', 'Note moyenne (1 600+ avis)'],
			principles: {
				eyebrow: '~/standards',
				title: 'Ma façon de construire.',
				items: [
					[
						'Architecture',
						'POO / PSR-4, Composer, WP-CLI, structure type Bedrock. Du code que votre prochain développeur pourra maintenir.',
					],
					[
						'Performance',
						'Les Core Web Vitals font partie du développement, mesurés avant et après, pas une retouche finale.',
					],
					[
						'Livraison',
						'CI/CD avec GitHub Actions, Docker / WP-Env en local, prévisualisations sur Vercel, passation documentée.',
					],
					[
						'Expérience produit',
						'Produits WordPress commerciaux livrés à plus de 36 000 exemplaires, notés 4,5/5 sur plus de 1 600 avis : support, mises à jour et compatibilité à grande échelle.',
					],
				],
			},
			roles: {
				eyebrow: '~/disponibilité',
				title: 'Postes qui m’intéressent.',
				items: [
					'Ingénieur WordPress ou full-stack senior / lead (télétravail)',
					'Architecture et livraison WordPress headless (Faust.js, Next.js, WPGraphQL)',
					'Renfort pour agences : thèmes de blocs, WooCommerce, audits de performance',
				],
			},
			architecture: {
				eyebrow: '~/exemple',
				title: 'Ce site en est l’exemple.',
				text: "Un frontend Next.js (Faust.js) sur Vercel, un backend WordPress headless via WPGraphQL, un cache Apollo typé depuis le schéma généré, des animations sur mesure et un fond WebGL. Les éditeurs gardent WordPress ; les visiteurs profitent d'un frontend rapide.",
			},
			final: {
				title: 'Parlons de votre équipe.',
				lead: 'Envoyez quelques lignes sur le poste ou le projet. Je réponds sous un jour ouvré.',
				cta: 'Me contacter',
				client: "Vous cherchez plutôt un site ?",
				clientCta: 'Voir les services et les prix',
			},
		},
```

- [ ] **Step 8: Verify build still parses.** Run `npm run lint`. Expected: no errors. (HomeHero still reads `hero.cv`; Task 3 fixes it, so do not run the page yet.)

- [ ] **Step 9: Commit**

```bash
git add lib/i18n.js components/Header/Header.js
git commit -m "i18n: engineering + paths copy (EN/FR), neutral hero/contact copy, Engineering nav entry

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `/engineering` page

**Files:**
- Create: `components/Engineering/Engineering.js`, `components/Engineering/Engineering.module.scss`, `components/Engineering/index.js`
- Create: `pages/engineering.js`
- Modify: `components/index.js` (append export)

**Interfaces:**
- Consumes: `useCopy().engineering`, `.cv`, `Playground` (no props), `track(event, props)`.
- Produces: `Engineering` default component (no props), exported from `components`.

- [ ] **Step 1: Barrel.** `components/Engineering/index.js`:

```js
export { default as Engineering } from './Engineering';
```

Check an existing barrel (`components/Services/index.js`) and match its style exactly if it differs. Append to `components/index.js`:

```js
export { Engineering } from './Engineering';
export { Paths } from './Paths';
```

(`Paths` is created in Task 3; add its line there instead if you run this task first.)

- [ ] **Step 2: Component.** `components/Engineering/Engineering.js`:

```js
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
```

Confirm `Playground` is importable as `import { Playground } from '../Playground'` (its barrel exists, `components/index.js` exports it from `./Playground`).

- [ ] **Step 3: Styles.** `components/Engineering/Engineering.module.scss` (mirrors Services vocabulary):

```scss
@import 'styles/breakpoints';
@import 'styles/tokens';

// Engineering page: recruiter / tech-lead profile. Same visual vocabulary as
// Services (mono eyebrow, tight headings, white pill CTA, hairline dividers).

$edge: clamp(1rem, 5vw, 5rem);

.component {
	max-width: var(--wpe--container--max-width);
	margin: 0 auto;
	padding: 0 $edge;
}

.hero {
	padding: clamp(4rem, 12vw, 9rem) 0 clamp(3rem, 7vw, 6rem);
}

.section {
	padding: clamp(4rem, 9vw, 8rem) 0;
	border-top: var(--wpe--border--light);
	opacity: 0;
	transform: translateY(1.5rem);
	transition: opacity 0.7s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);

	&.is-in {
		opacity: 1;
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		opacity: 1;
		transform: none;
		transition: none;
	}
}

.eyebrow {
	margin: 0 0 1.25rem;
	font-family: var(--font-geist-mono), monospace;
	font-size: fs(sm);
	letter-spacing: 0.02em;
	text-transform: lowercase;
	color: $c-accent;
}

.hero-title {
	margin: 0;
	max-width: 16ch;
	font-size: clamp(2.75rem, 8vw, 6.5rem);
	line-height: 1;
	letter-spacing: -0.04em;
	font-weight: fw(bold);
	color: $c-base;
}

.title {
	margin: 0;
	max-width: 20ch;
	font-size: clamp(2rem, 5vw, 3.75rem);
	line-height: 1.05;
	letter-spacing: -0.03em;
	font-weight: fw(bold);
	color: $c-base;
}

.hero-lead,
.lead {
	margin: clamp(1.25rem, 3vw, 2rem) 0 0;
	max-width: 56ch;
	font-size: clamp(1.05rem, 1.6vw, 1.35rem);
	line-height: 1.5;
	color: rgba(255, 255, 255, 0.7);
}

.actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 1rem 1.5rem;
	margin-top: clamp(1.75rem, 4vw, 2.5rem);
}

.primary {
	display: inline-flex;
	align-items: center;
	padding: 0.95rem 1.75rem;
	border-radius: 999px;
	background: $c-base;
	color: #000;
	font-weight: fw(medium);
	text-decoration: none;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.85;
	}
}

.secondary,
.link {
	color: $c-base;
	text-decoration: underline;
	text-underline-offset: 0.25em;
}

.note {
	margin: 1.25rem 0 0;
	font-family: var(--font-geist-mono), monospace;
	font-size: fs(sm);
	color: rgba(255, 255, 255, 0.5);
}

.stats {
	display: flex;
	flex-wrap: wrap;
	gap: 2rem 4rem;
	margin-top: clamp(2.5rem, 6vw, 4.5rem);
}

.stat {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.stat-value {
	font-size: clamp(2.25rem, 5vw, 3.5rem);
	line-height: 1;
	letter-spacing: -0.03em;
	font-weight: fw(bold);
	color: $c-base;
}

.stat-suffix {
	color: $c-accent;
}

.stat-label {
	font-size: fs(sm);
	color: rgba(255, 255, 255, 0.5);
}

.grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: clamp(2rem, 4vw, 3rem);
	margin: clamp(2.5rem, 5vw, 4rem) 0 0;
	padding: 0;
	list-style: none;

	@media (max-width: 47.99rem) {
		grid-template-columns: 1fr;
	}
}

.item-title {
	margin: 0;
	font-size: clamp(1.15rem, 2vw, 1.5rem);
	font-weight: fw(bold);
	color: $c-base;
}

.item-text {
	margin: 0.6rem 0 0;
	max-width: 48ch;
	line-height: 1.5;
	color: rgba(255, 255, 255, 0.7);
}

.roles {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin: clamp(2rem, 4vw, 3rem) 0 0;
	padding: 0;
	list-style: none;
	font-size: clamp(1.05rem, 1.6vw, 1.3rem);
	color: rgba(255, 255, 255, 0.85);

	li::before {
		content: '→ ';
		color: $c-accent;
	}
}

.final {
	text-align: left;
}
```

Run `npm run lint:styles`; if it flags the repo's `max-width` media-query convention, copy the pattern used in `Services.module.scss` (check its `@include`/`$breakpoint-*` usage for the mobile grid) and match it.

- [ ] **Step 4: Page.** `pages/engineering.js`:

```js
import { useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import { Header, Footer, Main, SEO, Engineering } from '../components';
import { SITE_CHROME_QUERY, siteChromeVariables } from '../fragments/SiteChrome';
import { useCopy } from '../lib/i18n';

// Static page: takes precedence over the WordPress catch-all. The WP query only
// feeds the shared footer (same menu as the home page).
export default function EngineeringPage() {
	const { engineering } = useCopy();
	const { data } = useQuery(EngineeringPage.query, { variables: EngineeringPage.variables() });
	const siteTitle = data?.generalSettings?.title ?? 'constantin.saguin';
	const footerMenu = data?.footerMenuItems?.nodes ?? [];

	return (
		<>
			<SEO title={engineering.seo.title} description={engineering.seo.description} />
			<Header title={siteTitle} />
			<Main>
				<Engineering />
			</Main>
			<Footer title={siteTitle} menuItems={footerMenu} />
		</>
	);
}

EngineeringPage.query = SITE_CHROME_QUERY;
EngineeringPage.variables = siteChromeVariables;

export function getStaticProps(ctx) {
	return getNextStaticProps(ctx, { Page: EngineeringPage });
}
```

- [ ] **Step 5: Verify.** `npm run lint && npm run lint:styles`, then `npm run dev` and:
  - `curl -s -o /dev/null -w "%{http_code}" localhost:3000/engineering` -> `200`
  - `curl -s localhost:3000/fr/engineering | grep -c "Ingénieur senior pour votre équipe"` -> `1` or more.
  - Open `/engineering` at 1280px and 375px: hero, stats, principles, Playground, roles, architecture, final CTA all visible; header shows 4 items without overflow; language switch stays on `/engineering`.

- [ ] **Step 6: Commit**

```bash
git add components/Engineering components/index.js pages/engineering.js
git commit -m "Add /engineering page for recruiters and tech leads (EN/FR)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Home hub: Paths strip, hero CTAs, remove Playground

**Files:**
- Create: `components/Paths/Paths.js`, `components/Paths/Paths.module.scss`, `components/Paths/index.js`
- Modify: `components/index.js` (ensure `Paths` export from Task 2 Step 1 present)
- Modify: `components/HomeHero/HomeHero.js:104,226-234`
- Modify: `wp-templates/front-page.js` (imports + `<Main>` children)

**Interfaces:**
- Consumes: `useCopy().paths` (`{ eyebrow, title, items: [{ title, text, cta, href, target }] }`), `hero.pro`.
- Produces: `Paths` default component (no props).

- [ ] **Step 1: Paths barrel.** `components/Paths/index.js`: `export { default as Paths } from './Paths';` (match `components/Services/index.js` style).

- [ ] **Step 2: Component.** `components/Paths/Paths.js`:

```js
import Link from 'next/link';
import classNames from 'classnames/bind';
import styles from './Paths.module.scss';
import { useCopy } from '../../lib/i18n';
import { track } from '../../lib/track';

let cx = classNames.bind(styles);

// Audience splitter on the home page: one card per visitor type.
export default function Paths() {
	const { paths } = useCopy();

	return (
		<section id="paths" className={cx('component')} aria-labelledby="paths-title">
			<p className={cx('eyebrow')}>{paths.eyebrow}</p>
			<h2 id="paths-title" className={cx('title')}>
				{paths.title}
			</h2>
			<ul className={cx('cards')}>
				{paths.items.map((item) => (
					<li key={item.target}>
						<Link
							className={cx('card')}
							href={item.href}
							onClick={() => track('cta_click', { location: 'home_paths', target: item.target })}
						>
							<h3 className={cx('card-title')}>{item.title}</h3>
							<p className={cx('card-text')}>{item.text}</p>
							<span className={cx('card-cta')}>{item.cta} →</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
```

- [ ] **Step 3: Styles.** `components/Paths/Paths.module.scss`:

```scss
@import 'styles/breakpoints';
@import 'styles/tokens';

$edge: clamp(1rem, 5vw, 5rem);

.component {
	max-width: var(--wpe--container--max-width);
	margin: 0 auto;
	padding: clamp(4rem, 9vw, 8rem) $edge;
}

.eyebrow {
	margin: 0 0 1.25rem;
	font-family: var(--font-geist-mono), monospace;
	font-size: fs(sm);
	text-transform: lowercase;
	color: $c-accent;
}

.title {
	margin: 0;
	font-size: clamp(2rem, 5vw, 3.75rem);
	line-height: 1.05;
	letter-spacing: -0.03em;
	font-weight: fw(bold);
	color: $c-base;
}

.cards {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: clamp(1rem, 2vw, 1.5rem);
	margin: clamp(2rem, 4vw, 3rem) 0 0;
	padding: 0;
	list-style: none;

	@media (max-width: 47.99rem) {
		grid-template-columns: 1fr;
	}
}

.card {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	height: 100%;
	padding: clamp(1.5rem, 3vw, 2.5rem);
	border: var(--wpe--border--light);
	border-radius: 1rem;
	background: rgba(0, 0, 0, 0.35);
	color: $c-base;
	text-decoration: none;
	transition: border-color 0.2s, background 0.2s;

	&:hover,
	&:focus-visible {
		border-color: $c-accent;
		background: rgba(0, 0, 0, 0.55);
	}
}

.card-title {
	margin: 0;
	font-size: clamp(1.4rem, 2.6vw, 2rem);
	letter-spacing: -0.02em;
	font-weight: fw(bold);
}

.card-text {
	margin: 0;
	line-height: 1.5;
	color: rgba(255, 255, 255, 0.7);
}

.card-cta {
	margin-top: auto;
	font-weight: fw(medium);
	color: $c-accent;
}
```

- [ ] **Step 4: HomeHero secondary CTA.** In `components/HomeHero/HomeHero.js`: change line 104 to `const { hero } = useCopy();` and replace the secondary `<a ...>` block (lines ~226-234) with:

```jsx
						<Link
							className={cx('cta-button', 'cta-secondary')}
							href="/engineering"
							onClick={() => track('cta_click', { location: 'hero', target: 'engineering' })}
						>
							<span className={cx('cta-label')}>{hero.pro}</span>
						</Link>
```

- [ ] **Step 5: Front page.** In `wp-templates/front-page.js`: in the `'../components'` import replace `Playground,` with `Paths,`; in `<Main>` replace `<Playground />` with `<Paths />`. Resulting order: HomeHero, GalleryBanner, Statement, CaseStudies, Paths, Contact.

- [ ] **Step 6: Verify.** `npm run lint && npm run lint:styles`; `npm run dev`:
  - `curl -s localhost:3000/ | grep -c 'id="paths"'` -> `1`; `grep -c 'id="playground"'` -> `0`.
  - In the browser: hero secondary button navigates to `/engineering`; Paths cards link to `/services` and `/engineering`; `/#about` and `/#contact` still scroll to their sections; no console errors (the `playground` anchor is gone, check `grep -rn "playground" components/Header wp-templates lib` returns no stale section link).

- [ ] **Step 7: Commit**

```bash
git add components/Paths components/index.js components/HomeHero/HomeHero.js wp-templates/front-page.js
git commit -m "Home: audience split (Paths), hero quote + recruiter CTAs, stack grid moved to /engineering

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `/services` client-first rewrite

**Files:**
- Modify: `lib/i18n.js` (`services.hero.lead`, add `services.audience`, `services.offers.under`, replace `services.offers.items`, add `services.reassure`, replace `services.why.items`, replace `services.final.hire/hireCta`) in both locales
- Modify: `components/Services/Services.js` (offer card tech line, audience line, reassure section, final note link)
- Modify: `components/Services/Services.module.scss` (append `.audience`, `.tech`)

**Interfaces:**
- Consumes: item shape `{ title, price?, text, points[3], tech?, cta? }`, `c.audience`, `c.offers.under`, `c.reassure = { eyebrow, title, items: [[title, text]...] }`, `c.final.hire/hireCta`.

- [ ] **Step 1: EN hero/audience/under.** In `COPY.en.services`:
  - `hero.lead` -> `'A website that looks the part, loads fast and that you can update yourself. You work directly with the engineer who builds it, and you know the price before anything starts.'`
  - After the `hero` block add `audience: 'For shops, artisans, musicians, studios and independent businesses that want a site that works as hard as they do.',`
  - In `offers` add `under: 'Under the hood',`

- [ ] **Step 2: EN offers items.** Replace `offers.items` with:

```js
				items: [
					{
						title: 'Small Feature or Tweak',
						price: '$750',
						text: 'Something on your site needs to change and you want it done right, fast. A defined piece of work with a fixed price.',
						points: [
							'A new feature or fix, live within days',
							'Your checkout or product pages made easier to buy from',
							'Your site connected to the tools you already use',
						],
						tech: 'Custom Gutenberg blocks, WooCommerce hooks, plugin / API / payment integrations',
					},
					{
						title: 'Custom WordPress Development',
						price: '$2,000',
						text: 'A website built around your business, with an ultra-simple admin so your team can update text and images without breaking anything.',
						points: [
							'A design and features made for your brand, not a template',
							'An online shop that sells and is easy to run',
							'Edit your own pages with confidence',
						],
						tech: 'Block themes / Full Site Editing, custom Gutenberg blocks, WooCommerce, plugins & APIs',
					},
					{
						title: 'Website Rebuild / Modernization',
						price: '$3,500',
						text: 'Your site is slow, dated or hard to manage? Keep what works and replace what holds you back, without losing your content or your Google ranking.',
						points: [
							'A faster, fresher site on a solid foundation',
							'Your content and SEO preserved',
							'Hosting move handled for you if needed',
						],
						tech: 'Legacy theme to block theme / FSE, Composer & modern tooling, host or stack migration',
					},
					{
						title: 'Headless WordPress Setup',
						price: '$4,000',
						text: 'For brands that want an exceptionally fast, custom-feeling site while their team keeps the WordPress editor they already know.',
						points: [
							'Pages that load almost instantly',
							'The same editor and workflow as today',
							'Room to grow without redoing everything',
						],
						tech: 'Faust.js / Next.js + WPGraphQL, previews, SEO & image optimization, Vercel and CI/CD',
					},
					{
						title: 'Not sure what you need?',
						text: 'Small fixes, SEO, migrations, speed, an urgent issue, or just an idea. Describe it in a few lines and I come back with a written quote and a clear next step.',
						points: [
							'Free and without commitment',
							'No technical knowledge needed',
							'Reply within one business day',
						],
						cta: 'Describe your project',
					},
				],
```

- [ ] **Step 3: EN reassure + why + final.** Add after `process` block:

```js
			reassure: {
				eyebrow: '~/peace-of-mind',
				title: 'No surprises.',
				items: [
					['A fixed quote', 'Scope, price and timeline are agreed in writing before any work starts.'],
					[
						'You stay in control',
						'A simple admin panel: update text, images and products yourself, without risk of breaking the site.',
					],
					[
						'A clean handover',
						'You get a short guide and a walkthrough, and I stay available after launch.',
					],
				],
			},
```

Replace `why.items` with (the two technical items now live on `/engineering`):

```js
				items: [
					[
						'Product-grade experience',
						'Founder of WolfThemes: commercial WordPress products shipped 36,000+ times, rated 4.5/5 across 1,600+ reviews.',
					],
					[
						'Built to last',
						'Clean, documented code that any developer can pick up later, and a site that stays fast as it grows.',
					],
					[
						'Direct and available',
						'No account manager in between. Based in France (CEST), working across EU and US time zones.',
					],
				],
```

Replace `final.hire` / `final.hireCta` with `hire: 'Hiring a senior engineer?',` and `hireCta: 'See my engineering profile',`.

- [ ] **Step 4: FR hero/audience/under.** In `COPY.fr.services`:
  - `hero.lead` -> `"Un site à la hauteur de votre activité, rapide, et que vous pouvez mettre à jour vous-même. Vous travaillez directement avec l'ingénieur qui le construit, et vous connaissez le prix avant tout démarrage."`
  - After `hero` add `audience: 'Pour les boutiques, artisans, musiciens, studios et indépendants qui veulent un site à la hauteur de leur énergie.',`
  - In `offers` add `under: 'Sous le capot',`

- [ ] **Step 5: FR offers items.** Replace `offers.items` with:

```js
				items: [
					{
						title: 'Fonctionnalité ou ajustement ciblé',
						price: '700 €',
						text: "Quelque chose doit changer sur votre site et vous voulez que ce soit bien fait, vite. Un travail défini, à prix fixe.",
						points: [
							'Une nouvelle fonctionnalité ou une correction, en ligne en quelques jours',
							'Votre tunnel de commande ou vos fiches produit plus faciles à acheter',
							'Votre site relié aux outils que vous utilisez déjà',
						],
						tech: 'Blocs Gutenberg sur mesure, hooks WooCommerce, intégrations de plugins / API / paiement',
					},
					{
						title: 'Développement WordPress sur mesure',
						price: '1 800 €',
						text: "Un site construit autour de votre activité, avec une administration ultra-simple pour que votre équipe modifie textes et images sans rien casser.",
						points: [
							'Un design et des fonctionnalités à l’image de votre marque, pas un modèle',
							'Une boutique en ligne qui vend et reste facile à gérer',
							'Modifiez vos pages en toute confiance',
						],
						tech: 'Thèmes de blocs / Full Site Editing, blocs Gutenberg personnalisés, WooCommerce, plugins & API',
					},
					{
						title: 'Refonte / Modernisation de site',
						price: '3 200 €',
						text: "Votre site est lent, daté ou difficile à gérer ? On garde ce qui fonctionne et on remplace ce qui vous freine, sans perdre votre contenu ni votre référencement.",
						points: [
							'Un site plus rapide et plus frais, sur de bonnes bases',
							'Contenu et SEO préservés',
							"Changement d'hébergeur pris en charge si besoin",
						],
						tech: "Thème classique vers thème de blocs / FSE, Composer & outils modernes, migration d'hébergeur ou de stack",
					},
					{
						title: 'Installation WordPress headless',
						price: '3 700 €',
						text: "Pour les marques qui veulent un site exceptionnellement rapide et sur mesure, tandis que leur équipe garde l'éditeur WordPress qu'elle connaît.",
						points: [
							'Des pages qui s’affichent presque instantanément',
							'Le même éditeur et les mêmes habitudes qu’aujourd’hui',
							'De la marge pour grandir sans tout refaire',
						],
						tech: "Faust.js / Next.js + WPGraphQL, prévisualisation, SEO & optimisation des images, Vercel et CI/CD",
					},
					{
						title: "Pas sûr de ce qu'il vous faut ?",
						text: 'Petites corrections, SEO, migrations, vitesse, une urgence, ou simplement une idée. Décrivez-la en quelques lignes et je reviens vers vous avec un devis écrit et la suite à donner.',
						points: [
							'Gratuit et sans engagement',
							'Aucune connaissance technique requise',
							'Réponse sous un jour ouvré',
						],
						cta: 'Décrire mon projet',
					},
				],
```

- [ ] **Step 6: FR reassure + why + final.** Add after `process`:

```js
			reassure: {
				eyebrow: '~/sérénité',
				title: 'Pas de mauvaise surprise.',
				items: [
					['Un devis fixe', 'Périmètre, prix et délai validés par écrit avant tout démarrage.'],
					[
						'Vous gardez la main',
						"Une administration simple : modifiez textes, images et produits vous-même, sans risquer de casser le site.",
					],
					[
						'Une passation soignée',
						'Vous recevez un court guide et une démonstration, et je reste disponible après la mise en ligne.',
					],
				],
			},
```

Replace `why.items` with:

```js
				items: [
					[
						'Une expérience de produit',
						'Fondateur de WolfThemes : des produits WordPress commerciaux livrés à plus de 36 000 exemplaires, notés 4,5/5 sur plus de 1 600 avis.',
					],
					[
						'Fait pour durer',
						"Un code propre et documenté que n'importe quel développeur pourra reprendre, et un site qui reste rapide en grandissant.",
					],
					[
						'Direct et disponible',
						"Pas de chef de projet intermédiaire. Basé en France (CEST), je travaille avec l'Europe et les États-Unis.",
					],
				],
```

Replace `final.hire` / `final.hireCta` with `hire: 'Vous recrutez un ingénieur senior ?',` and `hireCta: 'Voir mon profil technique',`.

- [ ] **Step 7: Component edits.** In `components/Services/Services.js`:
  - Change `const { services: c, cv } = useCopy();` to `const { services: c } = useCopy();`
  - After `<p className={cx('hero-lead')}>{c.hero.lead}</p>` add `<p className={cx('audience')}>{c.audience}</p>`
  - In the offer card, after the `points` `<ul>` (inside `offer-main`) add:

```jsx
								{item.tech && (
									<p className={cx('tech')}>
										<span>{c.offers.under}:</span> {item.tech}
									</p>
								)}
```

  - After the `process` section add:

```jsx
			<section className={cx('section')} data-reveal>
				<p className={cx('eyebrow')}>{c.reassure.eyebrow}</p>
				<h2 className={cx('title')}>{c.reassure.title}</h2>
				<ul className={cx('grid', 'steps')}>
					{c.reassure.items.map(([title, text]) => (
						<li key={title}>
							<h3 className={cx('item-title')}>{title}</h3>
							<p className={cx('item-text')}>{text}</p>
						</li>
					))}
				</ul>
			</section>
```

  - Replace the final `<a className={cx('email')} href={cv} ...>{c.final.hireCta}</a>` with:

```jsx
					<Link
						className={cx('email')}
						href="/engineering"
						onClick={() => track('cta_click', { location: 'services_final', target: 'engineering' })}
					>
						{c.final.hireCta} →
					</Link>
```

- [ ] **Step 8: Styles.** Append to `components/Services/Services.module.scss`:

```scss
.audience {
	margin: 1rem 0 0;
	max-width: 52ch;
	font-size: fs(sm);
	color: rgba(255, 255, 255, 0.5);
}

.tech {
	margin: 1rem 0 0;
	max-width: 56ch;
	font-family: var(--font-geist-mono), monospace;
	font-size: fs(sm);
	line-height: 1.5;
	color: rgba(255, 255, 255, 0.4);

	span {
		color: rgba(255, 255, 255, 0.55);
	}
}
```

- [ ] **Step 9: Verify.** `npm run lint && npm run lint:styles`; `npm run dev`:
  - `curl -s localhost:3000/services | grep -c "Under the hood"` -> at least `4`; `curl -s localhost:3000/fr/services | grep -c "Sous le capot"` -> at least `4`.
  - Browser, EN and FR: hero shows lead + audience line; 4 priced cards show benefit, 3 outcome bullets and the muted tech line; the "Not sure?" card has no tech line; "No surprises" section renders; the final note links to `/engineering`; prices unchanged.

- [ ] **Step 10: Commit**

```bash
git add lib/i18n.js components/Services
git commit -m "Services: client-first copy (benefits first, stack as 'under the hood'), reassurance section, link recruiters to /engineering

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Final verification

**Files:** none (fixes only if a check fails)

- [ ] **Step 1: Static checks.** `npm run lint && npm run lint:styles && npm run format:check`. Fix any reports (`npm run format` for formatting), re-run until clean.
- [ ] **Step 2: Production build.** `npm run build`. Expected: succeeds; routes include `/engineering` and `/services`.
- [ ] **Step 3: Manual pass.** Serve with `npm run start` and walk `/`, `/services`, `/engineering`, `/contact` in EN and `/fr/...` at 1280px and 375px against the Review Focus list above; confirm the Contact form still receives `?topic=Hiring` from `/engineering` CTAs.
- [ ] **Step 4: Graph + commit.** Run `graphify update .`, commit any formatting fixes:

```bash
git add -A
git commit -m "Format and final fixes for dual-audience routing

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

(Skip the commit if there is nothing to commit.)
