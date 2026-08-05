import { useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { Container, NavigationMenu, SkipNavigationLink } from '../../components';
import styles from './Header.module.scss';

let cx = classNames.bind(styles);

// Normalise a path for comparison, matching NavigationMenu's own logic so
// "/about/" and "/about" both resolve to the same item.
function normalizePath(value) {
	const path = (value ?? '').split('?')[0].split('#')[0];
	return path.replace(/\/+$/, '') || '/';
}

// The front page is a single scroller: each menu item points at a section
// rendered on it. Map a menu path's slug to the matching section id (with a few
// aliases so "Work"/"Case Studies" both land on the case-studies block).
const SECTION_ALIASES = {
	'': 'home',
	work: 'case-studies',
	works: 'case-studies',
	project: 'case-studies',
	projects: 'case-studies',
	'case-study': 'case-studies',
	'case-studies': 'case-studies',
};

function sectionIdFor(path) {
	const slug = normalizePath(path).replace(/^\//, '').split('/').pop();
	return SECTION_ALIASES[slug] ?? slug;
}

export default function Header({ title = 'Headless by WP Engine', menuItems }) {
	const [isNavShown, setIsNavShown] = useState(false);

	// Turn every menu item into a one-page scroll link: if a section with the
	// matching id exists on the page, smooth-scroll to it instead of navigating.
	// Items with no matching section keep their normal link behaviour.
	const handleItemClick = (item, event) => {
		if (typeof document === 'undefined') return;
		const id = sectionIdFor(item?.path);
		const target = id && document.getElementById(id);
		if (!target) return;
		event.preventDefault();
		setIsNavShown(false);
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		window.history.replaceState(null, '', id === 'home' ? '/' : `#${id}`);
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
		</header>
	);
}
