import { useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { Container, NavigationMenu, SkipNavigationLink } from '../../components';
import { getScrollY, scrollTo } from '../../lib/scroll';
import { useRouter } from 'next/router';
import { useCopy } from '../../lib/i18n';
import styles from './Header.module.scss';

let cx = classNames.bind(styles);

// Fixed three-item menu. `section` is the on-page element id the item scrolls
// to when it exists on the current page; otherwise the link navigates normally.
const NAV = [
	{ key: 'home', path: '/', section: 'home' },
	{ key: 'services', path: '/services', section: 'services' },
	{ key: 'contact', path: '/#contact', section: 'contact' },
];

// Absolute page Y that lands a section at its resting position, honouring the
// target's scroll-margin-top (the about section pulls itself down with a
// negative margin). rect.top + shared scrollY is the element's document top, so
// this is stable regardless of the current scroll position.
function restingScrollY(target) {
	const margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
	return getScrollY() + target.getBoundingClientRect().top - margin;
}

// Smooth-scroll to a section and land exactly on its resting position. The
// pinned works carousel begins its horizontal travel precisely at top === 0
// (see CaseStudies: targetX = clamp(-section.top, 0, maxX)), so the landing must
// be pixel-exact. Rather than let the browser's native smooth scroll undershoot
// and then hard-snap (which shows a jump), this animates to the target itself
// and recomputes it each frame, so it converges exactly with no correction. The
// animation bows out the moment the user takes over scrolling.
function scrollToSection(target) {
	if (typeof window === 'undefined') {
		target.scrollIntoView({ block: 'start' });
		return;
	}

	const targetY = Math.round(restingScrollY(target));

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		scrollTo(targetY, { immediate: true });
		return;
	}

	scrollTo(targetY, {
		duration: 1.1,
		easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
	});
}

export default function Header({ title = 'Headless by WP Engine' }) {
	const [isNavShown, setIsNavShown] = useState(false);
	const { locale, asPath } = useRouter();
	const { nav } = useCopy();
	const other = locale === 'fr' ? 'en' : 'fr';
	const items = NAV.map((item) => ({
		...item,
		id: item.key,
		label: nav[item.key],
		parentId: null,
		target: null,
		cssClasses: [],
		__typename: 'MenuItem',
		menu: { node: { name: 'Primary' } },
	}));

	// One-page scroll link: if the item's section exists on this page,
	// smooth-scroll to it instead of navigating.
	const handleItemClick = (item, event) => {
		if (typeof document === 'undefined') return;
		const id = item?.section;
		const target = id && document.getElementById(id);
		if (!target) return;
		event.preventDefault();
		setIsNavShown(false);
		scrollToSection(target);
		window.history.replaceState(null, '', id === 'home' ? window.location.pathname : `#${id}`);
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
						menuItems={items}
						onItemClick={handleItemClick}
					/>
					{/* NEXT_LOCALE records the explicit choice so geo redirect (proxy.js) stops overriding it. */}
					<Link
						href={asPath.split('#')[0]}
						locale={other}
						className={cx('lang')}
						hrefLang={other}
						onClick={() => {
							document.cookie = `NEXT_LOCALE=${other}; path=/; max-age=31536000; samesite=lax`;
						}}
					>
						<span className={cx({ current: locale !== 'fr' })}>EN</span> |{' '}
						<span className={cx({ current: locale === 'fr' })}>FR</span>
					</Link>
				</div>
			</Container>
		</header>
	);
}
