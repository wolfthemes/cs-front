import { useRouter } from 'next/router';

// All UI copy that isn't served by WordPress. Menu labels come from WP in
// English, so `menu` maps the section slug to its translation.
const COPY = {
	en: {
		menu: {},
		hero: {
			title: ['Senior ', 'Web', ' Engineer'],
			intro: [
				"Founder of WolfThemes, I've been building commercial",
				'WordPress products used by more than 36,000 customers worldwide.',
				'Today, I focus on engineering modern, scalable web',
				'applications designed for performance and longevity.',
			],
			shuffle: 'engineering',
			stats: ['Professional experience', 'Installs in production', 'Average rating (1,600+ reviews)'],
			cta: "Let's connect",
		},
		about: {
			eyebrow: '~/about',
			headline:
				'From scaling modern infrastructures to engineering smooth interactive experiences, I build modern websites designed for longevity and performance.',
			lead: 'I build robust WordPress products that solve real business needs and deliver lasting value. My work goes beyond clean interfaces — it combines thoughtful engineering, performance, and usability to create websites people enjoy using.',
			support:
				"I started in the late 00's by designing MySpace profiles for bands.  Now I create full web solutions. I love to work with musicians, labels, artists, associations and small businesses.",
		},
		playground: {
			title: 'From architecture to the frontend.',
			columns: ['Architecture & Backend', 'Infrastructure & DevOps', 'Frontend & Interaction'],
			items: [
				[
					'Headless WordPress (Faust / Next.js)',
					'WPGraphQL, REST API',
					'OOP / PSR-4',
					'Composer',
					'WP-CLI',
					'Multisite',
				],
				[
					'Linux / nginx',
					'Docker, WP-Env, WP VIP',
					'Bedrock',
					'CI/CD (GitHub Actions)',
					'DigitalOcean, Vercel',
					'CDN',
				],
				[
					'React / Next.js',
					'Gutenberg / FSE',
					'SCSS / CSS3',
					'Scroll-driven animation (GSAP)',
					'Performance / Core Web Vitals',
					'AI-assisted workflow (Claude Code)',
				],
			],
		},
		contact: {
			title: "Let's build something worth shipping.",
			lead: 'Senior full-time remote roles and select contract work. Based in France (CEST), working across EU and US time zones.',
			cta: 'Get in touch',
		},
		gallery: 'Selected work',
		viewProject: 'View project',
		footer: 'Powered by Headless WordPress.',
		seo: {
			title: 'Constantin Saguin — Senior WordPress Engineer',
			description:
				'Senior WordPress engineer with 14 years shipping production systems. Founder of WolfThemes. Open to senior full-time remote roles and select contract work.',
			locale: 'en_US',
		},
	},
	fr: {
		menu: { about: 'À propos', 'case-studies': 'Projets', playground: 'Stack', contact: 'Contact' },
		hero: {
			title: ['Ingénieur ', 'Web', ' Senior'],
			intro: [
				'Fondateur de WolfThemes, je développe des produits',
				'WordPress commerciaux utilisés par plus de 36 000 clients dans le monde.',
				"Aujourd'hui, je me concentre sur l'ingénierie d'applications web",
				'modernes et évolutives, pensées pour la performance et la durabilité.',
			],
			shuffle: "l'ingénierie",
			stats: ["Années d'expérience", 'Installations en production', 'Note moyenne (1 600+ avis)'],
			cta: 'Discutons',
		},
		about: {
			eyebrow: '~/à-propos',
			headline:
				"De la mise à l'échelle d'infrastructures modernes à l'ingénierie d'expériences interactives fluides, je construis des sites web modernes pensés pour la durabilité et la performance.",
			lead: "Je construis des produits WordPress robustes qui répondent à de vrais besoins métier et apportent une valeur durable. Mon travail va au-delà des interfaces soignées : il allie ingénierie réfléchie, performance et ergonomie pour créer des sites que les gens aiment utiliser.",
			support:
				"J'ai commencé à la fin des années 2000 en créant des profils MySpace pour des groupes de musique. Aujourd'hui, je conçois des solutions web complètes. J'aime travailler avec des musiciens, des labels, des artistes, des associations et des petites entreprises.",
		},
		playground: {
			title: "De l'architecture au frontend.",
			columns: ['Architecture & Backend', 'Infrastructure & DevOps', 'Frontend & Interaction'],
			items: [
				[
					'WordPress headless (Faust / Next.js)',
					'WPGraphQL, API REST',
					'POO / PSR-4',
					'Composer',
					'WP-CLI',
					'Multisite',
				],
				[
					'Linux / nginx',
					'Docker, WP-Env, WP VIP',
					'Bedrock',
					'CI/CD (GitHub Actions)',
					'DigitalOcean, Vercel',
					'CDN',
				],
				[
					'React / Next.js',
					'Gutenberg / FSE',
					'SCSS / CSS3',
					'Animation au scroll (GSAP)',
					'Performance / Core Web Vitals',
					'Workflow assisté par IA (Claude Code)',
				],
			],
		},
		contact: {
			title: 'Construisons quelque chose qui mérite d’être livré.',
			lead: "Postes seniors en télétravail à temps plein et missions ciblées. Basé en France (CEST), je travaille avec l'Europe et les États-Unis.",
			cta: 'Me contacter',
		},
		gallery: 'Sélection de projets',
		viewProject: 'Voir le projet',
		footer: 'Propulsé par WordPress headless.',
		seo: {
			title: 'Constantin Saguin — Ingénieur WordPress Senior',
			description:
				"Ingénieur WordPress senior avec 14 ans d'expérience en production. Fondateur de WolfThemes. Ouvert aux postes seniors en télétravail à temps plein et aux missions ciblées.",
			locale: 'fr_FR',
		},
	},
};

export function useCopy() {
	const { locale } = useRouter();
	return COPY[locale] ?? COPY.en;
}
