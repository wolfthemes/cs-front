import { useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import { Header, Footer, Main, SEO, Services } from '../components';
import { SITE_CHROME_QUERY, siteChromeVariables } from '../fragments/SiteChrome';
import { useCopy } from '../lib/i18n';

// Static page: takes precedence over the WordPress catch-all. The WP query only
// feeds the shared footer (same menu as the home page).
export default function ServicesPage() {
	const { services } = useCopy();
	const { data } = useQuery(ServicesPage.query, { variables: ServicesPage.variables() });
	const siteTitle = data?.generalSettings?.title ?? 'constantin.saguin';
	const footerMenu = data?.footerMenuItems?.nodes ?? [];

	return (
		<>
			<SEO title={services.seo.title} description={services.seo.description} />
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
