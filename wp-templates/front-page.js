import { useEffect } from 'react';
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
	Playground,
	Contact,
	SEO,
} from '../components';

export default function Component() {
	const { data } = useQuery(Component.query, {
		variables: Component.variables(),
	});

	// One-page anchor correction. When the page is opened at a hash (e.g.
	// /#about), the browser jumps to the target during first paint — while the
	// fallback font is still active. Once the web fonts swap in, sections above
	// the target (HomeHero can exceed its min-height) grow and shove the target
	// down, leaving the previous section bleeding in at the top. Re-assert the
	// position after fonts are ready (and on the next frame) so it lands flush.
	useEffect(() => {
		if (typeof window === 'undefined') return undefined;
		const id = window.location.hash.slice(1);
		if (!id) return undefined;

		let raf = 0;
		const snap = () => {
			const el = document.getElementById(id);
			if (el) el.scrollIntoView({ block: 'start' });
		};

		snap();
		const fontsReady = window.document.fonts?.ready ?? Promise.resolve();
		fontsReady.then(() => {
			raf = requestAnimationFrame(snap);
		});

		return () => {
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

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
				<Playground />
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
