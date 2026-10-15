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
