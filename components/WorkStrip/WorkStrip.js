import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { getImageProps } from 'next/image';
import classNames from 'classnames/bind';
import styles from './WorkStrip.module.scss';
import { SafeHtml } from '../SafeHtml';
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

// Static "recent work" proof: the first few projects that have a featured image,
// each linking to its case study. `details` adds the excerpt and tech tags under
// each card (Engineering page). Renders nothing until (and unless) the works
// load, so a WP hiccup never leaves an empty heading.
export default function WorkStrip({ details = false, location = 'services_work' }) {
	const { services } = useCopy();
	const c = services.work;
	// Same fallback as CaseStudies: if `workSkills` isn't in the schema the detailed
	// query errors, so fall back to the skills-free one (cards just lose their tags).
	const detailed = useQuery(WorkStrip.detailQuery, { skip: !details });
	const base = useQuery(WorkStrip.query, { skip: details && !detailed.error });
	const data = detailed.data ?? base.data;
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
								onClick={() => track('cta_click', { location, target: work.title })}
							>
								<span className={cx('media')}>
									<Thumb image={image} alt={image.altText || work.title} />
								</span>
								<span className={cx('caption')}>
									<span className={cx('name')}>{work.title}</span>
									{work.workYear && <span className={cx('year')}>{work.workYear}</span>}
								</span>
								{details && work.excerpt && (
									<SafeHtml className={cx('excerpt')} html={work.excerpt} />
								)}
								{details && work.workSkills?.nodes?.length > 0 && (
									<ul className={cx('tags')} aria-label="Tech used">
										{work.workSkills.nodes.map((skill) => (
											<li key={skill.id} className={cx('tag')}>
												{skill.name}
											</li>
										))}
									</ul>
								)}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

const WORK_FIELDS = `
	id
	title
	uri
	excerpt
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
`;

WorkStrip.query = gql`
	query GetWorkStrip {
		works(first: 8) {
			nodes {
				${WORK_FIELDS}
			}
		}
	}
`;

WorkStrip.detailQuery = gql`
	query GetWorkStripDetails {
		works(first: 8) {
			nodes {
				${WORK_FIELDS}
				workSkills {
					nodes {
						id
						name
						slug
					}
				}
			}
		}
	}
`;
