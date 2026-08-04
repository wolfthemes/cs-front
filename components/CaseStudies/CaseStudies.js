import React, { useEffect, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';
import className from 'classnames/bind';
import styles from './CaseStudies.module.scss';

let cx = className.bind(styles);

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

function Card({ work }) {
	const image = work.featuredImage?.node;
	return (
		<article className={cx('card')}>
			<Link href={work.uri ?? '#'} className={cx('card-link')}>
				<div className={cx('media')}>
					{image ? (
						<img
							src={image.sourceUrl}
							alt={image.altText || work.title}
							width={image.mediaDetails?.width}
							height={image.mediaDetails?.height}
							loading="lazy"
							decoding="async"
						/>
					) : (
						// No featured image set — show the title on a plain block so the
						// card still reads as a project.
						<span className={cx('media-fallback')}>{work.title}</span>
					)}
				</div>
				<div className={cx('meta')}>
					<h3 className={cx('card-title')}>{work.title}</h3>
					<span className={cx('card-cta')}>View project →</span>
				</div>
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

	useEffect(() => {
		const section = sectionRef.current;
		const track = trackRef.current;
		if (!section || !track || works.length === 0) return undefined;

		// Reduced motion / no-JS falls back to a plain horizontal scroll strip
		// (handled in CSS); don't pin or transform anything.
		if (prefersReducedMotion()) return undefined;

		const cards = Array.from(track.children);
		let raf = 0;
		let maxX = 0;
		let currentX = 0;

		// Vertical scroll room through the pinned section equals the horizontal
		// overflow of the track, so 1px of page scroll ≈ 1px of sideways travel.
		const layout = () => {
			maxX = Math.max(track.scrollWidth - window.innerWidth, 0);
			section.style.height = `${window.innerHeight + maxX}px`;
		};

		const tick = () => {
			// section.top runs from 0 down to -maxX while the sticky child is pinned.
			const top = section.getBoundingClientRect().top;
			const targetX = clamp(-top, 0, maxX);

			currentX += (targetX - currentX) * TRACK_EASE;
			if (Math.abs(targetX - currentX) < 0.15) currentX = targetX;
			track.style.transform = `translate3d(${-currentX}px, 0, 0)`;

			// Subtle parallax: nudge each image opposite to its distance from the
			// viewport centre as it travels across.
			const vw = window.innerWidth;
			cards.forEach((card) => {
				const img = card.querySelector('img');
				if (!img) return;
				const rect = card.getBoundingClientRect();
				const rel = (rect.left + rect.width / 2 - vw / 2) / vw; // ~ -1..1
				img.style.transform = `translate3d(${clamp(-rel, -1, 1) * PARALLAX}px, 0, 0) scale(1.14)`;
			});

			raf = requestAnimationFrame(tick);
		};

		layout();
		window.addEventListener('resize', layout);
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', layout);
			section.style.height = '';
			track.style.transform = '';
			cards.forEach((card) => {
				const img = card.querySelector('img');
				if (img) img.style.transform = '';
			});
		};
	}, [works.length]);

	if (works.length === 0) return null;

	return (
		<section ref={sectionRef} className={cx('component')} aria-label="Case studies">
			<div className={cx('sticky')}>
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
