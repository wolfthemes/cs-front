import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { Container, NavigationMenu, SkipNavigationLink } from '../../components';
import { onScrollFrame } from '../../lib/scroll';
import { useRouter } from 'next/router';
import { useCopy } from '../../lib/i18n';
import styles from './Header.module.scss';

let cx = classNames.bind(styles);

// Fixed four-item menu. `cta` items are always highlighted (see NavigationMenu).
const NAV = [
	{ key: 'home', path: '/' },
	{ key: 'services', path: '/services' },
	{ key: 'engineering', path: '/engineering' },
	{ key: 'contact', path: '/contact', cta: true },
];

export default function Header({ title = 'Headless by WP Engine' }) {
	const [isNavShown, setIsNavShown] = useState(false);
	// Sticky menu that tucks away while scrolling down and returns on scroll up.
	const [hidden, setHidden] = useState(false);
	const [stuck, setStuck] = useState(false);

	useEffect(
		() =>
			onScrollFrame((y, velocity) => {
				if (y < 80) {
					setStuck(false);
					setHidden(false);
					return;
				}
				setStuck(true);
				// Ignore tiny jitters so it doesn't flicker.
				if (velocity > 2) setHidden(true);
				else if (velocity < -2) setHidden(false);
			}),
		[]
	);
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

	return (
		<header className={cx('component', { hidden, stuck })}>
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
