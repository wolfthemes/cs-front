import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import { scrollTo } from '../lib/scroll';
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
	VideoScrollBackground,
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
			if (el) scrollTo(el, { immediate: true });
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
			{/* Home uses the site-level SEO defaults so the title/description match
			    the canonical resume metadata rather than the bare WP site title. */}
			<SEO />
			{/* Fixed video backdrop, scrubbed frame-by-frame by whole-page scroll.
			    Fixed at z-index -1, so it sits behind every section; GrainOverlay
			    (max z-index, screen blend) composites over it. */}
			<VideoScrollBackground fixed src="/video/hero-scroll.mp4" />
			<Header title={siteTitle} description={siteDescription} menuItems={primaryMenu} />
			{/* Transparent so the fixed video backdrop shows through. Main paints
			    an opaque black by default (also on body), which would hide the
			    z-index:-1 video; the front page lets the footage be the ground. */}
			<Main style={{ backgroundColor: 'transparent' }}>
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
