import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Services.module.scss';
import { ShuffleText } from '../ShuffleText';
import { useCopy } from '../../lib/i18n';

let cx = classNames.bind(styles);

const STATS = [
	{ value: '15', suffix: 'y' },
	{ value: '36', suffix: 'k+' },
	{ value: '4.5', suffix: '/5' },
];

// Full-width proof band between the page's text sections. The numbers decode
// (ShuffleText) once, the first time the band scrolls into view.
export default function StatBand() {
	const { services: c } = useCopy();
	const ref = useRef(null);
	const [seen, setSeen] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return undefined;
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				setSeen(true);
				io.disconnect();
			},
			{ threshold: 0.4 }
		);
		io.observe(node);
		return () => io.disconnect();
	}, []);

	return (
		<section ref={ref} className={cx('band')}>
			<ul className={cx('band-list')}>
				{STATS.map((stat, i) => (
					<li key={i} className={cx('band-stat')}>
						<span className={cx('band-value')}>
							<ShuffleText text={stat.value} play={seen} stagger={90} />
							<span className={cx('band-suffix')}>{stat.suffix}</span>
						</span>
						<span className={cx('band-label')}>{c.stats[i]}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
