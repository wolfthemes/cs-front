import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { getImageProps } from 'next/image';
import classNames from 'classnames/bind';
import styles from './WorkStrip.module.scss';
import { useCopy } from '../../lib/i18n';
import { track } from '../../lib/track';

let cx = classNames.bind(styles);

const COUNT = 4;

// Thumbnail rendered at a quarter of the viewport on desktop, half on mobile;
// routed through Next's optimizer like the home carousel images.
function Thumb({ image, alt }) {
	const { props } = getImageProps({
		src: image.sourceUrl,
		alt,
		width: image.mediaDetails?.width || 1600,
		height: image.mediaDetails?.height || 900,
		sizes: '(max-width: 768px) 50vw, 25vw',
		quality: 70,
	});
	return <img {...props} loading="lazy" decoding="async" />;
}

// Static "recent work" proof for the Services page: the first few projects that
// have a featured image, each linking to its case study. Renders nothing until
// (and unless) the works load, so a WP hiccup never leaves an empty heading.
export default function WorkStrip() {
	const { services } = useCopy();
	const c = services.work;
	const { data } = useQuery(WorkStrip.query);
	const works = (data?.works?.nodes ?? []).filter((w) => w.featuredImage?.node).slice(0, COUNT);

	if (works.length === 0) return null;

	return (
		<section className={cx('component')} aria-labelledby="work-title">
			<p className={cx('eyebrow')}>{c.eyebrow}</p>
			<h2 id="work-title" className={cx('title')}>
				{c.title}
			</h2>
			<ul className={cx('grid')}>
				{works.map((work) => {
					const image = work.featuredImage.node;
					const external = Boolean(work.workLinkUrl);
					return (
						<li key={work.id}>
							<Link
								className={cx('card')}
								href={work.workLinkUrl || work.uri || '#'}
								target={external ? '_blank' : undefined}
								rel={external ? 'noopener noreferrer' : undefined}
								onClick={() =>
									track('cta_click', { location: 'services_work', target: work.title })
								}
							>
								<span className={cx('media')}>
									<Thumb image={image} alt={image.altText || work.title} />
								</span>
								<span className={cx('caption')}>
									<span className={cx('name')}>{work.title}</span>
									{work.workYear && <span className={cx('year')}>{work.workYear}</span>}
								</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

WorkStrip.query = gql`
	query GetWorkStrip {
		works(first: 8) {
			nodes {
				id
				title
				uri
				workYear
				workLinkUrl
				featuredImage {
					node {
						sourceUrl
						altText
						mediaDetails {
							width
							height
						}
					}
				}
			}
		}
	}
`;
