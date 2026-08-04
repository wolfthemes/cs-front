import classNames from 'classnames/bind';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './NavigationMenu.module.scss';
import stylesFromWP from './NavigationMenuClassesFromWP.module.scss';
import { flatListToHierarchical } from '@faustwp/core';
import { BrandIcon } from '../BrandIcon';

let cx = classNames.bind(styles);
let cxFromWp = classNames.bind(stylesFromWP);

// Normalise a path for comparison: drop query/hash and any trailing slash so
// "/about/" and "/about" match. Empty path collapses to "/".
function normalizePath(value) {
	const path = (value ?? '').split('?')[0].split('#')[0];
	return path.replace(/\/+$/, '') || '/';
}

export default function NavigationMenu({ menuItems, className, onItemClick }) {
	const router = useRouter();

	if (!menuItems) {
		return null;
	}

	// WPGraphQL's cssClasses only carries classes added by hand in wp-admin (e.g.
	// "button"); the dynamic current-menu-item class isn't exposed, so the active
	// item is derived here from the current route instead.
	const currentPath = normalizePath(router.asPath);

	// Based on https://www.wpgraphql.com/docs/menus/#hierarchical-data
	const hierarchicalMenuItems = flatListToHierarchical(menuItems);

	function renderMenu(items) {
		return (
			<ul className={cx('menu')}>
				{items.map((item) => {
					const { id, path, label, target, children, cssClasses } = item;

					// @TODO - Remove guard clause after ghost menu items are no longer appended to array.
					if (!item.hasOwnProperty('__typename')) {
						return null;
					}

					const isActive = path && normalizePath(path) === currentPath;

					return (
						<li key={id} className={`${cxFromWp(cssClasses)} ${cx({ active: isActive })}`.trim()}>
							<Link
								href={path ?? ''}
								target={target || undefined}
								rel={target === '_blank' ? 'noopener noreferrer' : undefined}
								onClick={(event) => onItemClick?.(item, event)}
							>
								<BrandIcon url={path} className={cx('icon')} />
								{label ?? ''}
							</Link>
							{children.length ? renderMenu(children) : null}
						</li>
					);
				})}
			</ul>
		);
	}

	return (
		<nav
			className={cx(['component', className])}
			role="navigation"
			aria-label={`${menuItems[0]?.menu?.node?.name} menu`}
		>
			{renderMenu(hierarchicalMenuItems)}
		</nav>
	);
}

NavigationMenu.fragments = {
	entry: gql`
		fragment NavigationMenuItemFragment on MenuItem {
			id
			path
			label
			target
			parentId
			cssClasses
			menu {
				node {
					name
				}
			}
		}
	`,
};
