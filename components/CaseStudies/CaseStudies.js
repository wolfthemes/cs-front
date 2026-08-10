import React, { useEffect, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import { getImageProps } from 'next/image';
import className from 'classnames/bind';
import styles from './CaseStudies.module.scss';
import { onScrollFrame } from '../../lib/scroll';

let cx = className.bind(styles);

// Card width is clamp(260px, 40vw, 560px) (see .card) — feed that to the
// optimizer so it serves a right-sized WebP/AVIF instead of the raw WP
// upload (some of these were 1.7-1.9MB PNGs at full original size).
const CARD_SIZES = '(max-width: 768px) 70vw, 40vw';
const CARD_QUALITY = 70;

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Parallax strength (px the image shifts inside its frame from one edge of the
// viewport to the other) and how snappy the track eases toward the scroll
// position (0..1; lower = smoother, more lag).
const PARALLAX = 40;
const TRACK_EASE = 0.12;

// Routes the WP-hosted featured image through Next's optimizer instead of
// serving the raw upload (some originals were 1.7-1.9MB PNGs).
function CardImage({ image, alt }) {
	const { props: optimized } = getImageProps({
		src: image.sourceUrl,
		alt,
		width: image.mediaDetails?.width || 1600,
		height: image.mediaDetails?.height || 900,
		sizes: CARD_SIZES,
		quality: CARD_QUALITY,
	});
	return <img {...optimized} loading="lazy" decoding="async" />;
}

function Card({ work }) {
	const image = work.featuredImage?.node;
	// An explicit work_link_url (e.g. a live demo or external product page) wins
	// over the internal post URI, for both the image link and the CTA. When it's
	// set the destination is off-site, so open it in a new tab.
	const href = work.workLinkUrl || work.uri || '#';
	const isExternal = Boolean(work.workLinkUrl);
	const ctaLabel = work.workLinkText || 'View project';
	return (
		<article className={cx('card')}>
			<Link
				href={href}
				className={cx('card-link')}
				target={isExternal ? '_blank' : undefined}
				rel={isExternal ? 'noopener noreferrer' : undefined}
			>
				<div className={cx('media')}>
					{image ? (
						<CardImage image={image} alt={image.altText || work.title} />
					) : (
						// No featured image set — show the title on a plain block so the
						// card still reads as a project.
						<span className={cx('media-fallback')}>{work.title}</span>
					)}
				</div>
				<div className={cx('meta')}>
					<h3 className={cx('card-title')}>
						{work.title}
						{work.workYear && <span className={cx('card-year')}>[{work.workYear}]</span>}
					</h3>
					<span className={cx('card-cta')}>{ctaLabel} →</span>
				</div>
				{work.excerpt && (
					<div className={cx('card-excerpt')} dangerouslySetInnerHTML={{ __html: work.excerpt }} />
				)}
				{work.workSkills?.nodes?.length > 0 && (
					<ul className={cx('tags')} aria-label="Tech used">
						{work.workSkills.nodes.map((skill) => (
							<li key={skill.id} className={cx('tag')}>
								{skill.name}
							</li>
						))}
					</ul>
				)}
			</Link>
		</article>
	);
}

export default function CaseStudies() {
	// Try to fetch works with their skill tags. If the `workSkills` field isn't
	// in the schema (e.g. permalinks/taxonomy not refreshed yet), that query
	// fails validation and returns no data — which would hide the whole section.
	// So on error we fall back to a skills-free query: the case studies still
	// show, just without tags. Once the field is available, tags come back
	// automatically.
	const primary = useQuery(CaseStudies.query);
	const fallback = useQuery(CaseStudies.baseQuery, { skip: !primary.error });
	const data = primary.data ?? fallback.data;
	const works = data?.works?.nodes ?? [];

	const sectionRef = useRef(null);
	const trackRef = useRef(null);
	const stickyRef = useRef(null);
	// True once the WebGL image layer has taken over the visuals; the DOM
	// parallax below then stands down so the two don't fight.
	const glActiveRef = useRef(false);

	useEffect(() => {
		const section = sectionRef.current;
		const track = trackRef.current;
		if (!section || !track || works.length === 0) return undefined;

		// Reduced motion / no-JS falls back to a plain horizontal scroll strip
		// (handled in CSS); don't pin or transform anything.
		if (prefersReducedMotion()) return undefined;

		const cards = Array.from(track.children);
		let maxX = 0;
		let currentX = 0;
		// Card geometry cached once per layout so the per-frame parallax can place
		// each image from `currentX` instead of calling getBoundingClientRect()
		// (which, read after the track transform write, forces a reflow per card).
		let cardMetrics = [];

		// Vertical scroll room through the pinned section equals the horizontal
		// overflow of the track, so 1px of page scroll ≈ 1px of sideways travel.
		// scrollWidth drops the trailing padding AND the last card's margin for
		// overflowing flex children, which would leave the final card cut off at
		// the viewport edge — so measure the true right extent directly.
		const layout = () => {
			const last = cards[cards.length - 1];
			let contentRight = track.scrollWidth;
			if (last) {
				const trackPadRight = parseFloat(getComputedStyle(track).paddingRight) || 0;
				const lastMarginRight = parseFloat(getComputedStyle(last).marginRight) || 0;
				// offsetLeft includes the track's left padding, offsetWidth excludes
				// margins, so add the last card's right margin and the track's right
				// padding to get the full scrollable width.
				contentRight = last.offsetLeft + last.offsetWidth + lastMarginRight + trackPadRight;
			}
			maxX = Math.max(contentRight - window.innerWidth, 0);
			section.style.height = `${window.innerHeight + maxX}px`;

			// Cache each card's centre relative to the track's own origin. On screen
			// the track is translated by -currentX, so a card centre sits at
			// (offsetLeft + width/2 - currentX) in viewport space — no per-frame
			// measurement needed.
			cardMetrics = cards.map((card) => ({
				img: card.querySelector('img'),
				center: card.offsetLeft + card.offsetWidth / 2,
			}));
		};

		const tick = () => {
			// section.top runs from 0 down to -maxX while the sticky child is pinned.
			const top = section.getBoundingClientRect().top;
			const targetX = clamp(-top, 0, maxX);

			currentX += (targetX - currentX) * TRACK_EASE;
			if (Math.abs(targetX - currentX) < 0.15) currentX = targetX;
			track.style.transform = `translate3d(${-currentX}px, 0, 0)`;

			// Subtle parallax: nudge each image opposite to its distance from the
			// viewport centre as it travels across. Skipped when the WebGL layer
			// is driving the images (it owns the motion then).
			if (!glActiveRef.current) {
				const vw = window.innerWidth;
				cardMetrics.forEach(({ img, center }) => {
					if (!img) return;
					// Card centre in viewport space from cached geometry + this
					// frame's currentX — no getBoundingClientRect, no forced reflow.
					const rel = (center - currentX - vw / 2) / vw; // ~ -1..1
					img.style.transform = `translate3d(${clamp(-rel, -1, 1) * PARALLAX}px, 0, 0) scale(1.14)`;
				});
			}
		};

		layout();
		window.addEventListener('resize', layout);
		const unsubscribe = onScrollFrame(tick);

		return () => {
			unsubscribe();
			window.removeEventListener('resize', layout);
			section.style.height = '';
			track.style.transform = '';
			cards.forEach((card) => {
				const img = card.querySelector('img');
				if (img) img.style.transform = '';
			});
		};
	}, [works.length]);

	// WebGL image layer: velocity warp + RGB shift while the slider moves, plus a
	// hover ripple. Loaded client-only (ogl is browser-only) and skipped for
	// reduced motion; if WebGL or a texture upload fails it disposes itself and
	// the plain images stay.
	useEffect(() => {
		// WebGL image layer on the work carousel — same engine/shader as the
		// marquee. Flip to false to disable.
		const SLIDER_SHADER_ENABLED = true;

		const sticky = stickyRef.current;
		if (!SLIDER_SHADER_ENABLED || !sticky || works.length === 0 || prefersReducedMotion())
			return undefined;

		let effect;
		let cancelled = false;

		import('../../lib/ImagePlaneEffect').then(({ default: ImagePlaneEffect }) => {
			if (cancelled) return;
			effect = new ImagePlaneEffect(sticky, {
				selector: 'img',
				// Horizontal displacement — matches the carousel's sideways motion.
				dir: [1, 0],
				// Restore the image parallax inside the shader (the DOM parallax
				// stands down while the GL layer is active): the crop slides within
				// each frame as the card travels across the viewport.
				parallax: 0.06,
				// More velocity, less RGB: push the scroll-driven distortion/bend
				// harder while keeping the chromatic fringe subtle. maxVelo caps the
				// hover aberration; scrollGain scales the scroll distortion; chroma is
				// the RGB channel-split strength (below the 0.6 default).
				maxVelo: 0.02,
				scrollGain: 0.45,
				chroma: 0.25,
				// WP media is cross-origin and would taint the WebGL texture. Route it
				// through Next's same-origin image optimizer so the texture is clean.
				textureSrc: (img) =>
					`/_next/image?url=${encodeURIComponent(img.currentSrc || img.src)}&w=1920&q=75`,
			});
			if (effect.planes && effect.planes.length) glActiveRef.current = true;
		});

		return () => {
			cancelled = true;
			glActiveRef.current = false;
			if (effect) effect.dispose();
		};
	}, [works.length]);

	if (works.length === 0) return null;

	return (
		<section
			id="case-studies"
			ref={sectionRef}
			className={cx('component')}
			aria-label="Case studies"
		>
			<div ref={stickyRef} className={cx('sticky')}>
				<div className={cx('head')}>
					<p className={cx('eyebrow')}>~/case-studies</p>
				</div>
				<div ref={trackRef} className={cx('track')}>
					{works.map((work) => (
						<Card key={work.id} work={work} />
					))}
				</div>
			</div>
		</section>
	);
}

// Core fields every card needs, shared by both the skills and skills-free
// queries so they can't drift apart.
const WORK_FIELDS = `
	id
	title
	uri
	excerpt
	workYear
	workLinkUrl
	workLinkText
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

CaseStudies.query = gql`
	query GetCaseStudies {
		works(first: 20) {
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

// Fallback used when `workSkills` isn't available in the schema.
CaseStudies.baseQuery = gql`
	query GetCaseStudiesBase {
		works(first: 20) {
			nodes {
				${WORK_FIELDS}
			}
		}
	}
`;
