import Head from 'next/head';

// Person structured data (schema.org/Person) for the site owner. This is a
// personal resume site, so a single stable Person graph describes the whole
// thing — emitted as JSON-LD so search engines and AI crawlers can read it.
const PERSON_SCHEMA = {
	'@context': 'https://schema.org',
	'@type': 'Person',
	name: 'Constantin Saguin',
	url: 'https://constantin.saguin.com/',
	email: 'constantin@saguin.com',
	jobTitle: 'Senior WordPress Engineer',
	description:
		'Senior WordPress engineer with 14 years of experience. Founder of WolfThemes.',
	address: {
		'@type': 'PostalAddress',
		addressLocality: 'Alsace',
		addressCountry: 'FR',
	},
	sameAs: [
		'https://github.com/wolfthemes',
		'https://www.linkedin.com/in/constantin-saguin/?locale=en-US',
		'https://wolfthemes.com',
		'https://themeforest.net/user/wolf-themes',
	],
	knowsAbout: [
		'WordPress',
		'WooCommerce',
		'PHP',
		'React',
		'Next.js',
		'Faust.js',
		'Headless WordPress',
		'WPGraphQL',
		'REST API',
		'JavaScript',
		'SCSS',
		'GSAP',
		'Gutenberg',
		'Full Site Editing',
		'Elementor',
		'ACF',
		'Composer',
		'OOP / PSR-4',
		'WP-CLI',
		'WordPress Multisite',
		'Bedrock',
		'Docker',
		'Linux',
		'nginx',
		'CI/CD',
		'GitHub Actions',
		'Vercel',
		'CDN',
		'Core Web Vitals',
		'Claude Code',
	],
	worksFor: {
		'@type': 'Organization',
		name: 'WolfThemes',
		url: 'https://wolfthemes.com',
	},
	owns: [
		{
			'@type': 'SoftwareSourceCode',
			name: 'guty',
			codeRepository: 'https://github.com/wolfthemes/guty',
			url: 'https://www.npmjs.com/package/@csag/guty',
		},
	],
};

/**
 * Provide SEO related meta tags to a page.
 *
 * @param {Props} props The props object.
 * @param {string} props.title Used for the page title, og:title, twitter:title, etc.
 * @param {string} props.description Used for the meta description, og:description, twitter:description, etc.
 * @param {string} props.imageUrl Used for the og:image and twitter:image. NOTE: Must be an absolute url.
 * @param {string} props.url Used for the og:url, twitter:url and canonical.
 *
 * @returns {React.ReactElement} The SEO component
 */

// Site-level defaults for the one-page resume site. Content props (title,
// description, imageUrl, url) override these per page; everything else is stable
// across the whole site.
const SITE = {
	url: 'https://constantin.saguin.com',
	name: 'Constantin Saguin',
	title: 'Constantin Saguin — Senior WordPress Engineer',
	description:
		'Senior WordPress engineer with 14 years shipping production systems. Founder of WolfThemes. Open to senior full-time remote roles and select contract work.',
	// 1200×630 social card served from /public. Add the asset to keep previews rich.
	image: 'https://constantin.saguin.com/assets/img/og.png',
	imageWidth: '1200',
	imageHeight: '630',
	locale: 'en_US',
	author: 'Constantin Saguin',
	keywords:
		'WordPress developer, WordPress engineer, WooCommerce developer, PHP developer, WordPress theme developer, ThemeForest author, WolfThemes, freelance WordPress, remote WordPress',
};

export default function SEO({ title, description, imageUrl, url }) {
	const metaTitle = title || SITE.title;
	const metaDescription = description || SITE.description;
	const metaImage = imageUrl || SITE.image;
	const metaUrl = url || SITE.url;

	return (
		<Head>
			<title>{metaTitle}</title>
			<meta name="title" content={metaTitle} />
			<meta name="description" content={metaDescription} />
			<meta name="keywords" content={SITE.keywords} />
			<meta name="author" content={SITE.author} />
			<meta name="robots" content="index, follow" />
			<link rel="canonical" href={metaUrl} />

			<meta property="og:type" content="website" />
			<meta property="og:site_name" content={SITE.name} />
			<meta property="og:locale" content={SITE.locale} />
			<meta property="og:url" content={metaUrl} />
			<meta property="og:title" content={metaTitle} />
			<meta property="og:description" content={metaDescription} />
			<meta property="og:image" content={metaImage} />
			<meta property="og:image:width" content={SITE.imageWidth} />
			<meta property="og:image:height" content={SITE.imageHeight} />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:url" content={metaUrl} />
			<meta name="twitter:title" content={metaTitle} />
			<meta name="twitter:description" content={metaDescription} />
			<meta name="twitter:image" content={metaImage} />

			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
			/>
		</Head>
	);
}
