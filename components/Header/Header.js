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

// Absolute page Y that lands a section at its resting position, honouring the
// target's scroll-margin-top (the about section pulls itself down with a
// negative margin). rect.top + scrollY is the element's document top, so this is
// stable regardless of the current scroll position — and re-reading it each
// frame absorbs any late reflow.
function restingScrollY(target) {
	const margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
	return window.scrollY + target.getBoundingClientRect().top - margin;
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

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		window.scrollTo(0, Math.round(restingScrollY(target)));
		return;
	}

	let aborted = false;

	const abort = () => {
		aborted = true;
	};
	const cleanup = () => {
		window.removeEventListener('wheel', abort);
		window.removeEventListener('touchmove', abort);
		window.removeEventListener('keydown', abort);
	};

	window.addEventListener('wheel', abort, { passive: true });
	window.addEventListener('touchmove', abort, { passive: true });
	window.addEventListener('keydown', abort);

	const DURATION = 600; // ms
	const startY = window.scrollY;
	const startTime = performance.now();
	const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

	const step = (now) => {
		if (aborted) {
			cleanup();
			return;
		}
		const t = Math.min((now - startTime) / DURATION, 1);
		const targetY = restingScrollY(target);
		if (t < 1) {
			window.scrollTo(0, startY + (targetY - startY) * easeOutCubic(t));
			requestAnimationFrame(step);
		} else {
			window.scrollTo(0, Math.round(targetY));
			cleanup();
		}
	};

	requestAnimationFrame(step);
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
		scrollToSection(target);
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
