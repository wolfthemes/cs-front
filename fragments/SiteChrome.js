import { gql } from '@apollo/client';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from './GeneralSettings';
import { NavigationMenu } from '../components';

// Site title + footer menu: the data the shared <Footer> needs on pages that
// don't have their own WP template (services, contact). Pass as `Page.query`
// and `Page.variables` so `getNextStaticProps` prefetches it at build time.
export const SITE_CHROME_QUERY = gql`
	${BlogInfoFragment}
	${NavigationMenu.fragments.entry}
	query GetSiteChrome($footerLocation: MenuLocationEnum) {
		generalSettings {
			...BlogInfoFragment
		}
		footerMenuItems: menuItems(where: { location: $footerLocation }) {
			nodes {
				...NavigationMenuItemFragment
			}
		}
	}
`;

export const siteChromeVariables = () => ({ footerLocation: MENUS.FOOTER_LOCATION });
