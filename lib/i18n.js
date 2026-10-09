import { useRouter } from 'next/router';

// All UI copy that isn't served by WordPress. Menu labels come from WP in
// English. The header menu is fixed (see Header.js), so its labels live here.
const COPY = {
	en: {
		cv: '/Constantin-Saguin-Senior-WP-Dev-CV-EN.pdf',
		nav: { home: 'Home', services: 'Services', contact: 'Contact' },
		hero: {
			title: ['Senior ', 'Web', ' Engineer'],
			intro: [
				"Founder of WolfThemes, I've been building commercial",
				'WordPress products used by more than 36,000 customers worldwide.',
				'Today, I focus on engineering modern, scalable web',
				'applications designed for performance and longevity.',
			],
			shuffle: 'engineering',
			stats: [
				'Professional experience',
				'Installs in production',
				'Average rating (1,600+ reviews)',
			],
			cta: 'Freelance services',
			cv: 'Download CV',
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
		services: {
			seo: {
				title: 'WordPress Freelance Services — Constantin Saguin',
				description:
					'Senior freelance WordPress engineer: custom development (Gutenberg, WooCommerce), headless WordPress, rebuilds and migrations. From $750.',
			},
			hero: {
				eyebrow: '~/services',
				title: 'Senior WordPress engineering, on demand.',
				lead: 'Custom builds, WooCommerce, Gutenberg and headless setups from the founder of WolfThemes. You work directly with the engineer who writes the code.',
				cta: 'Get a free quote',
				secondary: 'See the offers',
				note: 'Remote · EU & US time zones · I reply within one business day',
				subject: 'Project inquiry',
			},
			stats: [
				'Professional experience',
				'Installs in production',
				'Average rating (1,600+ reviews)',
			],
			offers: {
				eyebrow: '~/offers',
				title: 'Pick a starting point.',
				lead: 'Prices are starting points. After a short brief you get an exact quote, before anything begins.',
				from: 'from',
				free: 'Free quote',
				cta: 'Request a quote',
				subject: 'Quote request',
				items: [
					{
						title: 'Migration',
						price: '$750',
						text: 'Move a site to a new host, stack or setup with no lost content and minimal downtime.',
						points: [
							'Host, domain & multisite migrations',
							'Classic to block theme or headless',
							'Staging, testing & rollback plan',
						],
					},
					{
						title: 'Custom WordPress Development',
						price: '$2,000',
						text: 'Custom themes, Gutenberg blocks and Full Site Editing, WooCommerce stores, integrations and advanced features.',
						points: [
							'Gutenberg / FSE themes & custom blocks',
							'WooCommerce customization & integrations',
							'Plugins, APIs & advanced development',
						],
					},
					{
						title: 'Website Rebuild / Modernization',
						price: '$3,500',
						text: 'Modernize an existing WordPress site without starting from scratch: keep what works, replace what holds you back.',
						points: [
							'Legacy theme to block theme / FSE',
							'Cleaner code, Composer & modern tooling',
							'Fresh design, content and SEO preserved',
						],
					},
					{
						title: 'Headless WordPress Setup',
						price: '$4,000',
						text: 'Keep the WordPress editor your team knows, get a blazing-fast Next.js frontend. The same stack as this site.',
						points: [
							'Faust.js / Next.js + WPGraphQL',
							'Previews, SEO & image optimization',
							'Vercel deployment & CI/CD',
						],
					},
					{
						title: 'Not sure what you need?',
						text: 'Describe your project in a few lines. I come back with a written quote and a clear next step.',
						points: [
							'Free and without commitment',
							'No technical knowledge needed',
							'Reply within one business day',
						],
						cta: 'Describe your project',
					},
				],
			},
			proof: { eyebrow: '~/proof', title: 'What clients say.' },
			process: {
				eyebrow: '~/process',
				title: 'From first email to shipped.',
				steps: [
					[
						'Send a short brief',
						'Your goal, a link to the current site if any, and a rough budget. Two lines is enough.',
					],
					['Get a clear quote', 'Scope, price and timeline, agreed before anything starts.'],
					['Build, ship, hand over', 'Regular updates, clean code and a documented handover.'],
				],
			},
			why: {
				eyebrow: '~/why-me',
				title: 'Why work with me.',
				items: [
					[
						'Product-grade experience',
						'Founder of WolfThemes: commercial WordPress products used by 36,000+ customers, rated 4.5/5 across 1,600+ reviews.',
					],
					[
						'Engineering, not page-building',
						'OOP / PSR-4, Composer, WP-CLI and CI/CD. Code your next developer can maintain.',
					],
					[
						'Fast by default',
						'Performance and Core Web Vitals are part of the build, not an afterthought.',
					],
					[
						'Direct and available',
						'No account manager in between. Based in France (CEST), working across EU and US time zones.',
					],
				],
			},
			faq: {
				eyebrow: '~/faq',
				title: 'Questions, answered.',
				items: [
					[
						'Do you only work on new builds?',
						'No. Rebuilds, migrations, bug fixing and technical work on existing WordPress sites are a big part of what I do.',
					],
					[
						'How is pricing decided?',
						'"From" prices are starting points for a typical scope. After a short brief you get an exact quote, so there are no surprises mid-project.',
					],
					[
						'Why go headless?',
						'When you want frontend speed and creative freedom while keeping the WordPress editor your team already knows. If you do not need that, a block theme is often better value, and I will tell you so.',
					],
					[
						'What should I send to get started?',
						'Your goal, a link to the current site (if any), and a rough budget and timeline. I will take it from there.',
					],
				],
			},
			final: {
				eyebrow: '~/contact',
				title: 'Tell me about your project.',
				lead: 'Send a few lines and I reply within one business day.',
				cta: 'Email me',
				subject: 'Project inquiry',
				hire: 'Also open to senior full-time remote roles.',
				hireCta: 'Download my CV',
			},
		},
		contactPage: {
			seo: {
				title: 'Contact — Constantin Saguin',
				description: 'Describe your project and get a written quote.',
			},
			eyebrow: '~/contact',
			title: 'Tell me about your project.',
			lead: 'A few lines are enough. I reply within one business day.',
			labels: {
				name: 'Name',
				email: 'Email',
				topic: 'About',
				budget: 'Budget',
				message: 'Your project',
			},
			budgets: ['Not sure yet', 'Under $2,000', '$2,000 – $5,000', '$5,000 – $10,000', '$10,000+'],
			submit: 'Send message',
			sending: 'Sending…',
			success: 'Thanks! Your message is on its way. I will reply within one business day.',
			error: 'Something went wrong. Please email me directly at',
			defaultTopic: 'Project inquiry',
		},
		seo: {
			title: 'Constantin Saguin — Senior WordPress Engineer',
			description:
				'Senior WordPress engineer with 15 years shipping production systems. Founder of WolfThemes. Open to senior full-time remote roles and select contract work.',
			locale: 'en_US',
		},
	},
	fr: {
		cv: '/Constantin-Saguin-Senior-WP-Dev-CV-FR.pdf',
		nav: { home: 'Accueil', services: 'Services', contact: 'Contact' },
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
			cta: 'Services freelance',
			cv: 'Télécharger le CV',
		},
		about: {
			eyebrow: '~/à-propos',
			headline:
				"De la mise à l'échelle d'infrastructures modernes à l'ingénierie d'expériences interactives fluides, je construis des sites web modernes pensés pour la durabilité et la performance.",
			lead: 'Je construis des produits WordPress robustes qui répondent à de vrais besoins métier et apportent une valeur durable. Mon travail va au-delà des interfaces soignées : il allie ingénierie réfléchie, performance et ergonomie pour créer des sites que les gens aiment utiliser.',
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
		services: {
			seo: {
				title: 'Services WordPress freelance — Constantin Saguin',
				description:
					'Ingénieur WordPress senior freelance : développement sur mesure (Gutenberg, WooCommerce), WordPress headless, refontes et migrations. À partir de 750 $.',
			},
			hero: {
				eyebrow: '~/services',
				title: 'Ingénierie WordPress senior, à la demande.',
				lead: "Développement sur mesure, WooCommerce, Gutenberg et architectures headless par le fondateur de WolfThemes. Vous travaillez directement avec l'ingénieur qui écrit le code.",
				cta: 'Obtenir un devis gratuit',
				secondary: 'Voir les offres',
				note: 'À distance · fuseaux horaires UE & US · réponse sous un jour ouvré',
				subject: 'Demande de projet',
			},
			stats: ["Années d'expérience", 'Installations en production', 'Note moyenne (1 600+ avis)'],
			offers: {
				eyebrow: '~/offres',
				title: 'Choisissez un point de départ.',
				lead: 'Les prix sont des points de départ. Après un court brief, vous recevez un devis précis avant tout démarrage.',
				from: 'à partir de',
				free: 'Devis gratuit',
				cta: 'Demander un devis',
				subject: 'Demande de devis',
				items: [
					{
						title: 'Migration',
						price: '750 $',
						text: "Déplacez un site vers un nouvel hébergeur, une nouvelle stack ou une nouvelle architecture, sans perte de contenu et avec un minimum d'interruption.",
						points: [
							'Migrations de serveur, domaine & multisite',
							'Classique vers thème de blocs ou headless',
							'Préproduction, tests & plan de retour arrière',
						],
					},
					{
						title: 'Développement WordPress sur mesure',
						price: '2 000 $',
						text: 'Thèmes sur mesure, blocs Gutenberg et Full Site Editing, boutiques WooCommerce, intégrations et fonctionnalités avancées.',
						points: [
							'Thèmes Gutenberg / FSE & blocs personnalisés',
							'Personnalisation WooCommerce & intégrations',
							'Plugins, API & développement avancé',
						],
					},
					{
						title: 'Refonte / Modernisation de site',
						price: '3 500 $',
						text: 'Modernisez un site WordPress existant sans repartir de zéro : on garde ce qui fonctionne, on remplace ce qui vous freine.',
						points: [
							'Thème classique vers thème de blocs / FSE',
							'Code plus propre, Composer & outils modernes',
							'Nouveau design, contenu et SEO préservés',
						],
					},
					{
						title: 'Installation WordPress headless',
						price: '4 000 $',
						text: "Gardez l'éditeur WordPress que votre équipe connaît, avec un frontend Next.js ultra-rapide. La même stack que ce site.",
						points: [
							'Faust.js / Next.js + WPGraphQL',
							'Prévisualisation, SEO & optimisation des images',
							'Déploiement Vercel & CI/CD',
						],
					},
					{
						title: "Pas sûr de ce qu'il vous faut ?",
						text: 'Décrivez votre projet en quelques lignes. Je reviens vers vous avec un devis écrit et la suite à donner.',
						points: [
							'Gratuit et sans engagement',
							'Aucune connaissance technique requise',
							'Réponse sous un jour ouvré',
						],
						cta: 'Décrire mon projet',
					},
				],
			},
			proof: {
				eyebrow: '~/avis',
				title: 'Ce que disent mes clients.',
				source: 'Vérifié sur Upwork',
			},
			process: {
				eyebrow: '~/méthode',
				title: 'Du premier email à la mise en ligne.',
				steps: [
					[
						'Envoyez un court brief',
						'Votre objectif, un lien vers le site actuel le cas échéant, et un budget approximatif. Deux lignes suffisent.',
					],
					['Recevez un devis clair', 'Périmètre, prix et délai, validés avant tout démarrage.'],
					[
						'Développement, livraison, passation',
						'Points réguliers, code propre et passation documentée.',
					],
				],
			},
			why: {
				eyebrow: '~/pourquoi-moi',
				title: 'Pourquoi travailler avec moi.',
				items: [
					[
						'Une expérience de produit',
						'Fondateur de WolfThemes : des produits WordPress commerciaux utilisés par plus de 36 000 clients, notés 4,5/5 sur plus de 1 600 avis.',
					],
					[
						"De l'ingénierie, pas de l'assemblage",
						'POO / PSR-4, Composer, WP-CLI et CI/CD. Du code que votre prochain développeur pourra maintenir.',
					],
					[
						'Rapide par défaut',
						"La performance et les Core Web Vitals font partie du développement, pas d'une retouche finale.",
					],
					[
						'Direct et disponible',
						"Pas de chef de projet intermédiaire. Basé en France (CEST), je travaille avec l'Europe et les États-Unis.",
					],
				],
			},
			faq: {
				eyebrow: '~/faq',
				title: 'Vos questions.',
				items: [
					[
						'Travaillez-vous uniquement sur des nouveaux projets ?',
						'Non. Les refontes, migrations, corrections de bugs et travaux techniques sur des sites WordPress existants représentent une grande part de mon activité.',
					],
					[
						'Comment le prix est-il déterminé ?',
						'Les prix « à partir de » correspondent à un périmètre standard. Après un court brief, vous recevez un devis précis, sans mauvaise surprise en cours de projet.',
					],
					[
						'Pourquoi choisir le headless ?',
						"Pour la vitesse et la liberté créative du frontend, tout en gardant l'éditeur WordPress que votre équipe connaît. Si ce n'est pas nécessaire, un thème de blocs est souvent plus rentable, et je vous le dirai.",
					],
					[
						'Que dois-je envoyer pour commencer ?',
						"Votre objectif, un lien vers le site actuel (le cas échéant), et un budget et un délai approximatifs. Je m'occupe du reste.",
					],
				],
			},
			final: {
				eyebrow: '~/contact',
				title: 'Parlez-moi de votre projet.',
				lead: 'Envoyez-moi quelques lignes, je réponds sous un jour ouvré.',
				cta: 'Écrivez-moi',
				subject: 'Demande de projet',
				hire: 'Aussi ouvert aux postes seniors en télétravail à temps plein.',
				hireCta: 'Télécharger mon CV',
			},
		},
		contactPage: {
			seo: {
				title: 'Contact — Constantin Saguin',
				description: 'Décrivez votre projet et recevez un devis écrit.',
			},
			eyebrow: '~/contact',
			title: 'Parlez-moi de votre projet.',
			lead: 'Quelques lignes suffisent. Je réponds sous un jour ouvré.',
			labels: {
				name: 'Nom',
				email: 'Email',
				topic: 'Sujet',
				budget: 'Budget',
				message: 'Votre projet',
			},
			budgets: [
				'Je ne sais pas encore',
				'Moins de 2 000 $',
				'2 000 – 5 000 $',
				'5 000 – 10 000 $',
				'10 000 $+',
			],
			submit: 'Envoyer',
			sending: 'Envoi…',
			success: 'Merci ! Votre message est parti. Je réponds sous un jour ouvré.',
			error: "Une erreur s'est produite. Écrivez-moi directement à",
			defaultTopic: 'Demande de projet',
		},
		seo: {
			title: 'Constantin Saguin — Ingénieur WordPress Senior',
			description:
				"Ingénieur WordPress senior avec 15 ans d'expérience en production. Fondateur de WolfThemes. Ouvert aux postes seniors en télétravail à temps plein et aux missions ciblées.",
			locale: 'fr_FR',
		},
	},
};

export function useCopy() {
	const { locale } = useRouter();
	return COPY[locale] ?? COPY.en;
}
