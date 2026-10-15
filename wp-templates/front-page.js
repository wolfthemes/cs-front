import { useQuery, gql } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import {
	Header,
	Footer,
	Main,
	NavigationMenu,
	HomeHero,
	GalleryBanner,
	Statement,
	CaseStudies,
	Paths,
	Contact,
	SEO,
	TrailBackground,
	// VideoScrollBackground, // statue scroll video, parked: see /lab/bg for the shader alternative
} from '../components';

export default function Component() {
	const { data } = useQuery(Component.query, {
		variables: Component.variables(),
	});

	const { title: siteTitle, description: siteDescription } = data?.generalSettings;
	const primaryMenu = data?.headerMenuItems?.nodes ?? [];
	const footerMenu = data?.footerMenuItems?.nodes ?? [];

	return (
		<>
			{/* Home uses the site-level SEO defaults so the title/description match
			    the canonical resume metadata rather than the bare WP site title. */}
			<SEO />
			{/* Fixed video backdrop, scrubbed frame-by-frame by whole-page scroll.
			    Fixed at z-index -1, so it sits behind every section; GrainOverlay
			    (max z-index, screen blend) composites over it. */}
			{/* <VideoScrollBackground fixed src="/video/hero-scroll.mp4" /> */}
			<TrailBackground />
			<Header title={siteTitle} description={siteDescription} menuItems={primaryMenu} />
			{/* Transparent so the fixed video backdrop shows through. Main paints
			    an opaque black by default (also on body), which would hide the
			    z-index:-1 video; the front page lets the footage be the ground. */}
			<Main style={{ backgroundColor: 'transparent' }}>
				<HomeHero />
				<GalleryBanner />
				<Statement />
				<CaseStudies />
				<Paths />
				<Contact />
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
