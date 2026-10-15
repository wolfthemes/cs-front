import { useRouter } from 'next/router';

// All UI copy that isn't served by WordPress. Menu labels come from WP in
// English. The header menu is fixed (see Header.js), so its labels live here.
const COPY = {
	en: {
		cv: '/Constantin-Saguin-Senior-Dev-CV-EN.pdf',
		nav: { home: 'Home', services: 'Services', engineering: 'Engineering', contact: 'Contact' },
		hero: {
			title: ['Senior ', 'Web', ' Engineer'],
			// One plain paragraph: SplitLines finds the real line breaks at render time.
			intro:
				"Founder of WolfThemes, I've been building commercial WordPress products shipped over 36,000 times worldwide. Today, I create fast, beautiful websites that are simple to manage and built to last.",
			shuffle: 'websites',
			stats: ['Professional experience', 'Licenses shipped', 'Average rating (1,600+ reviews)'],
			cta: 'See services & prices',
			pro: 'For teams & recruiters',
		},
		about: {
			eyebrow: '~/about',
			headline:
				'From scaling modern infrastructures to engineering smooth interactive experiences, I build modern websites designed for longevity and performance.',
			lead: 'I build robust WordPress products that solve real business needs and deliver lasting value. My work goes beyond clean interfaces — it combines thoughtful engineering, performance, and usability to create websites people enjoy using.',
			support:
				"It all started in the late 2000s, designing MySpace profiles for bands. Fifteen years and hundreds of projects later, I'm still just as excited about building things for the web. I especially enjoy working with musicians, labels, artists, organizations and independent businesses. Outside of code, you'll usually find me with my family, riding my motorcycle, hiking, or simply enjoying the outdoors.",
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
			lead: 'A new site, a rebuild or a senior remote role: tell me what you need. Based in France (CEST), working across EU and US time zones.',
			cta: 'Get in touch',
		},
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
					'Senior front-leaning full-stack engineer: React / Next.js with WordPress (remote)',
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
				lead: 'A website that looks the part, loads fast and that you can update yourself. You work directly with the engineer who builds it, and you know the price before anything starts.',
				cta: 'Get a free quote',
				secondary: 'See the offers',
				note: 'Remote · EU & US time zones · I reply within one business day',
				subject: 'Project inquiry',
			},
			marquee: [
				'Fast by default',
				'Simple to manage',
				'Built to last',
				'Fixed quote',
				'SEO preserved',
				'Mobile-first',
				'Direct contact',
				'Hosting & care',
			],
			work: { eyebrow: '~/work', title: 'Recent work.' },
			audience:
				'For shops, artisans, musicians, studios and independent businesses that want a site that works as hard as they do.',
			stats: ['Professional experience', 'Licenses shipped', 'Average rating (1,600+ reviews)'],
			offers: {
				eyebrow: '~/offers',
				title: 'Pick a starting point.',
				lead: 'Prices are starting points. After a short brief you get an exact quote, before anything begins.',
				from: 'from',
				free: 'Free quote',
				cta: 'Request a quote',
				subject: 'Quote request',
				under: 'Under the hood',
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
			reassure: {
				eyebrow: '~/peace-of-mind',
				title: 'No surprises.',
				items: [
					[
						'A fixed quote',
						'Scope, price and timeline are agreed in writing before any work starts.',
					],
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
			why: {
				eyebrow: '~/why-me',
				title: 'Why work with me.',
				items: [
					[
						'Product-grade experience',
						'Founder of WolfThemes: commercial WordPress products shipped 36,000+ times, rated 4.5/5 across 1,600+ reviews.',
						['36,000+ licenses', '4.5/5 · 1,600+ reviews'],
					],
					[
						'Built to last',
						'Clean, documented code that any developer can pick up later, and a site that stays fast as it grows.',
						['Documented', 'Maintainable', 'Fast as it grows'],
					],
					[
						'Direct and available',
						'No account manager in between. Based in France (CEST), working across EU and US time zones.',
						['Direct contact', 'EU & US time zones', 'Reply within 1 business day'],
					],
				],
			},
			faq: {
				eyebrow: '~/faq',
				title: 'Questions, answered.',
				items: [
					[
						'How much does it cost?',
						'Each offer has a starting price (from $750 to $4,000) for a typical scope. After a short brief you get a written, fixed quote, so there are no surprises mid-project.',
					],
					[
						'How does payment work?',
						'Depending on the project, either 50% upfront to start, or full payment upfront, as set out in your quote. Work always starts after the first payment.',
					],
					[
						'Can I update the site myself?',
						'Yes, that is the point. You edit text, images and products yourself in a simple interface, designed so you cannot break the layout. I hand it over with a short guide and a walkthrough.',
					],
					[
						'Do you handle hosting and maintenance?',
						'Yes. I can host your site and look after it after launch (updates, backups, security, small changes) as a simple monthly plan, or hand it over to your own host. Ask for details with your quote.',
					],
					[
						'Will I lose my Google ranking if you rebuild my site?',
						'No. Protecting it is part of every rebuild: URLs, titles, content and redirects are kept or carried across, so your SEO follows.',
					],
					[
						'Are revisions included?',
						'Yes. Rounds of feedback are part of every project; the exact scope is set in your quote.',
					],
					[
						'Do you only work on new builds?',
						'No. Rebuilds, migrations, bug fixing and technical work on existing WordPress sites are a big part of what I do.',
					],
					[
						'Do I need a headless setup?',
						'Rarely. Headless suits brands that want exceptional speed and creative freedom while keeping the WordPress editor. If you do not need that, a block theme is often better value, and I will tell you so.',
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
				cta: 'Get in touch',
				subject: 'Project inquiry',
				hire: 'Hiring a senior engineer?',
				hireCta: 'See my engineering profile',
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
				messageTeam: 'The role or collaboration',
				audience: 'I am looking for',
				company: 'Company / agency (optional)',
			},
			audiences: {
				client: 'A website for my business',
				team: 'A senior engineer (role or collaboration)',
			},
			budgets: ['Not sure yet', 'Under $2,000', '$2,000 – $5,000', '$5,000 – $10,000', '$10,000+'],
			submit: 'Send message',
			sending: 'Sending…',
			preferEmail: 'Prefer email?',
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
		cv: '/Constantin-Saguin-Senior-Dev-CV-FR.pdf',
		nav: { home: 'Accueil', services: 'Services', engineering: 'Ingénierie', contact: 'Contact' },
		hero: {
			title: ['Ingénieur ', 'Web', ' Senior'],
			intro:
				"Fondateur de WolfThemes, je développe des produits WordPress commerciaux livrés à plus de 36 000 exemplaires dans le monde. Aujourd'hui, je crée des sites web rapides et soignés, simples à gérer et conçus pour durer.",
			shuffle: 'rapides',
			stats: ["Années d'expérience", 'Licences livrées', 'Note moyenne (1 600+ avis)'],
			cta: 'Voir les services et tarifs',
			pro: 'Équipes & recruteurs',
		},
		about: {
			eyebrow: '~/à-propos',
			headline:
				"De la mise à l'échelle d'infrastructures modernes à l'ingénierie d'expériences interactives fluides, je construis des sites web modernes pensés pour la durabilité et la performance.",
			lead: 'Je construis des produits WordPress robustes qui répondent à de vrais besoins métier et apportent une valeur durable. Mon travail va au-delà des interfaces soignées : il allie ingénierie réfléchie, performance et ergonomie pour créer des sites que les gens aiment utiliser.',
			support:
				"Tout a commencé à la fin des années 2000, en créant des profils MySpace pour des groupes. Quinze ans et des centaines de projets plus tard, je suis toujours aussi enthousiaste à l'idée de construire des choses pour le web. J'aime particulièrement travailler avec des musiciens, des labels, des artistes, des associations et des entreprises indépendantes. En dehors du code, vous me trouverez le plus souvent avec ma famille, sur ma moto, en randonnée, ou simplement dehors dans la nature.",
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
			lead: "Un nouveau site, une refonte ou un poste senior en télétravail : dites-moi ce dont vous avez besoin. Basé en France (CEST), je travaille avec l'Europe et les États-Unis.",
			cta: 'Me contacter',
		},
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
					'Ingénieur full-stack senior orienté front : React / Next.js avec WordPress (télétravail)',
					'Architecture et livraison WordPress headless (Faust.js, Next.js, WPGraphQL)',
					'Renfort pour agences : block themes, WooCommerce, audits de performance',
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
				client: 'Vous cherchez plutôt un site ?',
				clientCta: 'Voir les services et les prix',
			},
		},
		gallery: 'Sélection de projets',
		viewProject: 'Voir le projet',
		footer: 'Propulsé par WordPress headless.',
		services: {
			seo: {
				title: 'Services WordPress freelance — Constantin Saguin',
				description:
					'Ingénieur WordPress senior freelance : développement sur mesure (Gutenberg, WooCommerce), WordPress headless, refontes et migrations. À partir de 700 €.',
			},
			hero: {
				eyebrow: '~/services',
				title: 'Ingénierie WordPress senior, à la demande.',
				lead: "Un site à la hauteur de votre activité, rapide, et que vous pouvez mettre à jour vous-même. Vous travaillez directement avec l'ingénieur qui le construit, et vous connaissez le prix avant tout démarrage.",
				cta: 'Obtenir un devis gratuit',
				secondary: 'Voir les offres',
				note: 'À distance · fuseaux horaires UE & US · réponse sous un jour ouvré',
				subject: 'Demande de projet',
			},
			marquee: [
				'Rapide par défaut',
				'Simple à gérer',
				'Fait pour durer',
				'Devis fixe',
				'SEO préservé',
				'Mobile-first',
				'Contact direct',
				'Hébergement & suivi',
			],
			work: {
				eyebrow: '~/réalisations',
				title: 'Réalisations récentes.',
			},
			audience:
				'Pour les boutiques, artisans, musiciens, studios et indépendants qui veulent un site à la hauteur de leur énergie.',
			stats: ["Années d'expérience", 'Licences livrées', 'Note moyenne (1 600+ avis)'],
			offers: {
				eyebrow: '~/offres',
				title: 'Choisissez un point de départ.',
				lead: 'Les prix sont des points de départ. Après un court brief, vous recevez un devis précis avant tout démarrage.',
				from: 'à partir de',
				free: 'Devis gratuit',
				cta: 'Demander un devis',
				subject: 'Demande de devis',
				under: 'Sous le capot',
				items: [
					{
						title: 'Fonctionnalité ou ajustement ciblé',
						price: '700 €',
						text: 'Quelque chose doit changer sur votre site et vous voulez que ce soit bien fait, vite. Un travail défini, à prix fixe.',
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
						text: 'Un site construit autour de votre activité, avec une administration ultra-simple pour que votre équipe modifie textes et images sans rien casser.',
						points: [
							'Un design et des fonctionnalités à l’image de votre marque, pas un modèle',
							'Une boutique en ligne qui vend et reste facile à gérer',
							'Modifiez vos pages en toute confiance',
						],
						tech: 'Block themes / Full Site Editing, blocs Gutenberg personnalisés, WooCommerce, plugins & API',
					},
					{
						title: 'Refonte / Modernisation de site',
						price: '3 200 €',
						text: 'Votre site est lent, daté ou difficile à gérer ? On garde ce qui fonctionne et on remplace ce qui vous freine, sans perdre votre contenu ni votre référencement.',
						points: [
							'Un site plus rapide et plus frais, sur de bonnes bases',
							'Contenu et SEO préservés',
							"Changement d'hébergeur pris en charge si besoin",
						],
						tech: "Thème classique vers block theme / FSE, Composer & outils modernes, migration d'hébergeur ou de stack",
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
						tech: 'Faust.js / Next.js + WPGraphQL, prévisualisation, SEO & optimisation des images, Vercel et CI/CD',
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
			reassure: {
				eyebrow: '~/sérénité',
				title: 'Pas de mauvaise surprise.',
				items: [
					['Un devis fixe', 'Périmètre, prix et délai validés par écrit avant tout démarrage.'],
					[
						'Vous gardez la main',
						'Une administration simple : modifiez textes, images et produits vous-même, sans risquer de casser le site.',
					],
					[
						'Une passation soignée',
						'Vous recevez un court guide et une démonstration, et je reste disponible après la mise en ligne.',
					],
				],
			},
			why: {
				eyebrow: '~/pourquoi-moi',
				title: 'Pourquoi travailler avec moi.',
				items: [
					[
						'Une expérience de produit',
						'Fondateur de WolfThemes : des produits WordPress commerciaux livrés à plus de 36 000 exemplaires, notés 4,5/5 sur plus de 1 600 avis.',
						['36 000+ licences', '4,5/5 · 1 600+ avis'],
					],
					[
						'Fait pour durer',
						"Un code propre et documenté que n'importe quel développeur pourra reprendre, et un site qui reste rapide en grandissant.",
						['Documenté', 'Maintenable', 'Rapide en grandissant'],
					],
					[
						'Direct et disponible',
						"Pas de chef de projet intermédiaire. Basé en France (CEST), je travaille avec l'Europe et les États-Unis.",
						['Contact direct', 'Fuseaux UE & US', 'Réponse sous un jour ouvré'],
					],
				],
			},
			faq: {
				eyebrow: '~/faq',
				title: 'Vos questions.',
				items: [
					[
						'Combien ça coûte ?',
						'Chaque offre a un prix de départ (de 700 € à 3 700 €) pour un périmètre standard. Après un court brief, vous recevez un devis écrit et ferme, sans mauvaise surprise en cours de projet.',
					],
					[
						'Comment se passe le paiement ?',
						'Selon le projet : 50 % à la commande, ou paiement intégral à la commande, selon les modalités de votre devis. Le travail démarre toujours après le premier paiement.',
					],
					[
						'Pourrai-je modifier le site moi-même ?',
						"Oui, c'est tout l'intérêt. Vous modifiez textes, images et produits vous-même, dans une interface simple, pensée pour que vous ne puissiez pas casser la mise en page. Je vous la présente avec un court guide et une démonstration.",
					],
					[
						"Proposez-vous l'hébergement et la maintenance ?",
						"Oui. Je peux héberger votre site et m'en occuper après la mise en ligne (mises à jour, sauvegardes, sécurité, petites modifications) via un abonnement mensuel simple, ou le confier à votre propre hébergeur. Demandez le détail avec votre devis.",
					],
					[
						"Vais-je perdre mon référencement Google lors d'une refonte ?",
						'Non. Le préserver fait partie de chaque refonte : URLs, titres, contenus et redirections sont conservés ou reportés, pour que votre SEO suive.',
					],
					[
						'Les révisions sont-elles incluses ?',
						'Oui. Des tours de retours font partie de chaque projet ; le cadre exact est précisé dans votre devis.',
					],
					[
						'Travaillez-vous uniquement sur des nouveaux projets ?',
						'Non. Les refontes, migrations, corrections de bugs et travaux techniques sur des sites WordPress existants représentent une grande part de mon activité.',
					],
					[
						'Ai-je besoin du headless ?',
						"Rarement. Le headless convient aux marques qui veulent une vitesse et une liberté créative exceptionnelles tout en gardant l'éditeur WordPress. Si ce n'est pas nécessaire, un block theme est souvent plus rentable, et je vous le dirai.",
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
				cta: 'Me contacter',
				subject: 'Demande de projet',
				hire: 'Vous recrutez un ingénieur senior ?',
				hireCta: 'Voir mon profil technique',
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
				messageTeam: 'Le poste ou la collaboration',
				audience: 'Je recherche',
				company: 'Entreprise / agence (facultatif)',
			},
			audiences: {
				client: 'Un site pour mon activité',
				team: 'Un ingénieur senior (poste ou collaboration)',
			},
			budgets: [
				'Je ne sais pas encore',
				'Moins de 1 800 €',
				'1 800 – 4 500 €',
				'4 500 – 9 000 €',
				'9 000 €+',
			],
			submit: 'Envoyer',
			sending: 'Envoi…',
			preferEmail: 'Vous préférez un email ?',
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
