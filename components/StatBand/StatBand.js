import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './StatBand.module.scss';
import { ShuffleText } from '../ShuffleText';

let cx = classNames.bind(styles);

const STATS = [
	{ value: '15', suffix: 'y' },
	{ value: '36', suffix: 'k+' },
	{ value: '4.5', suffix: '/5' },
];

// Full-width proof band between a page's text sections. The numbers decode
// (ShuffleText) once, the first time the band scrolls into view. `labels` are the
// three captions, in the same order as STATS; `compact` shrinks the figures.
export default function StatBand({ labels, compact = false }) {
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
		<section ref={ref} className={cx('band', { compact })}>
			<ul className={cx('list')}>
				{STATS.map((stat, i) => (
					<li key={i} className={cx('stat')}>
						<span className={cx('value')}>
							<ShuffleText text={stat.value} play={seen} stagger={90} />
							<span className={cx('suffix')}>{stat.suffix}</span>
						</span>
						<span className={cx('label')}>{labels[i]}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
