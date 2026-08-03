import { useQuery, gql } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import { Header, Footer, Main, NavigationMenu, HomeHero, GalleryBanner, Statement, CaseStudies, SEO } from '../components';

export default function Component() {
	const { data } = useQuery(Component.query, {
		variables: Component.variables(),
	});

	const { title: siteTitle, description: siteDescription } = data?.generalSettings;
	const primaryMenu = data?.headerMenuItems?.nodes ?? [];
	const footerMenu = data?.footerMenuItems?.nodes ?? [];

	return (
		<>
			<SEO title={siteTitle} description={siteDescription} />
			<Header title={siteTitle} description={siteDescription} menuItems={primaryMenu} />
			<Main>
				<HomeHero />
				<GalleryBanner />
				<Statement />
				<CaseStudies />
			</Main>
			<Footer title={siteTitle} menuItems={footerMenu} />
		</>
	);
}

Component.query = gql`
	${BlogInfoFragment}
	${NavigationMenu.fragments.entry}
	query GetPageData($headerLocation: MenuLocationEnum, $footerLocation: MenuLocationEnum) {
		generalSettings {
			...BlogInfoFragment
		}
		headerMenuItems: menuItems(where: { location: $headerLocation }) {
			nodes {
				...NavigationMenuItemFragment
			}
		}
		footerMenuItems: menuItems(where: { location: $footerLocation }) {
			nodes {
				...NavigationMenuItemFragment
			}
		}
	}
`;

Component.variables = () => {
	return {
		headerLocation: MENUS.PRIMARY_LOCATION,
		footerLocation: MENUS.FOOTER_LOCATION,
	};
};
