import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { getNextStaticProps } from '@faustwp/core';
import { Header, Footer, Main, SEO, Services } from '../components';
import { SITE_CHROME_QUERY, siteChromeVariables } from '../fragments/SiteChrome';
import { useCopy } from '../lib/i18n';

// Static page: takes precedence over the WordPress catch-all. The WP query only
// feeds the shared footer (same menu as the home page).
export default function ServicesPage() {
	const { services } = useCopy();
	const { locale } = useRouter();
	const { data } = useQuery(ServicesPage.query, { variables: ServicesPage.variables() });
	const siteTitle = data?.generalSettings?.title ?? 'constantin.saguin';
	const footerMenu = data?.footerMenuItems?.nodes ?? [];

	const url = `https://constantin.saguin.com${locale === 'fr' ? '/fr' : ''}/services`;
	const schema = [
		{
			'@type': 'ProfessionalService',
			'@id': `${url}#service`,
			name: 'Constantin Saguin — WordPress development',
			url,
			description: services.seo.description,
			provider: { '@id': 'https://constantin.saguin.com/#person' },
			areaServed: 'Worldwide',
			serviceType: [
				'WordPress development',
				'WooCommerce',
				'Headless WordPress',
				'Website rebuild',
			],
			priceRange: locale === 'fr' ? 'dès 700 €' : 'from $750',
		},
		{
			'@type': 'FAQPage',
			mainEntity: services.faq.items.map(([q, a]) => ({
				'@type': 'Question',
				name: q,
				acceptedAnswer: { '@type': 'Answer', text: a },
			})),
		},
	];

	return (
		<>
			<SEO
				title={services.seo.title}
				description={services.seo.description}
				crumb="Services"
				schema={schema}
			/>
			<Header title={siteTitle} />
			<Main>
				<Services />
			</Main>
			<Footer title={siteTitle} menuItems={footerMenu} />
		</>
	);
}

ServicesPage.query = SITE_CHROME_QUERY;
ServicesPage.variables = siteChromeVariables;

export function getStaticProps(ctx) {
	return getNextStaticProps(ctx, { Page: ServicesPage });
}
