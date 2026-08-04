import { useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { AboutPanel, Container, NavigationMenu, SkipNavigationLink } from '../../components';
import styles from './Header.module.scss';

let cx = classNames.bind(styles);

// Normalise a path for comparison, matching NavigationMenu's own logic so
// "/about/" and "/about" both resolve to the About item.
function normalizePath(value) {
	const path = (value ?? '').split('?')[0].split('#')[0];
	return path.replace(/\/+$/, '') || '/';
}

export default function Header({ title = 'Headless by WP Engine', menuItems }) {
	const [isNavShown, setIsNavShown] = useState(false);
	const [isAboutShown, setIsAboutShown] = useState(false);

	// Intercept the About menu item: instead of navigating, open the off-canvas
	// panel. Every other item keeps its normal link behaviour.
	const handleItemClick = (item, event) => {
		if (item?.path && normalizePath(item.path) === '/about') {
			event.preventDefault();
			setIsNavShown(false);
			setIsAboutShown(true);
		}
	};

	return (
		<header className={cx('component')}>
			<SkipNavigationLink />
			<Container>
				<div className={cx('navbar')}>
					<div className={cx('brand')}>
						<Link legacyBehavior href="/">
							<a className={cx('title')}>{title}</a>
						</Link>
					</div>
					<button
						type="button"
						className={cx('nav-toggle')}
						onClick={() => setIsNavShown(!isNavShown)}
						aria-label="Toggle navigation"
						aria-controls={cx('primary-navigation')}
						aria-expanded={isNavShown}
					>
						☰
					</button>
					<NavigationMenu
						className={cx(['primary-navigation', isNavShown ? 'show' : undefined])}
						menuItems={menuItems}
						onItemClick={handleItemClick}
					/>
				</div>
			</Container>
			<AboutPanel isOpen={isAboutShown} onClose={() => setIsAboutShown(false)} />
		</header>
	);
}
