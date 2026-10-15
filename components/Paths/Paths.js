import Link from 'next/link';
import classNames from 'classnames/bind';
import styles from './Paths.module.scss';
import { useCopy } from '../../lib/i18n';
import { track } from '../../lib/track';

let cx = classNames.bind(styles);

// Audience splitter on the home page: one card per visitor type.
export default function Paths() {
	const { paths } = useCopy();

	return (
		<section id="paths" className={cx('component')} aria-labelledby="paths-title">
			<p className={cx('eyebrow')}>{paths.eyebrow}</p>
			<h2 id="paths-title" className={cx('title')}>
				{paths.title}
			</h2>
			<ul className={cx('cards')}>
				{paths.items.map((item) => (
					<li key={item.target}>
						<Link
							className={cx('card')}
							href={item.href}
							onClick={() => track('cta_click', { location: 'home_paths', target: item.target })}
						>
							<h3 className={cx('card-title')}>{item.title}</h3>
							<p className={cx('card-text')}>{item.text}</p>
							<span className={cx('card-cta')}>{item.cta} →</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
