import React, { useEffect, useRef } from 'react';
import className from 'classnames/bind';
import styles from './VideoScrollBackground.module.scss';
import { getScrollY, onScrollFrame } from '../../lib/scroll';

let cx = className.bind(styles);

// Fullscreen video background scrubbed frame-by-frame by scroll. Nothing plays
// on its own: the video is paused and we drive `currentTime` directly from
// scroll position, so the footage runs forward as you scroll down and backward
// as you scroll up. This is the GSAP ScrollTrigger `scrub` pattern rebuilt on
// the project's native scroll stack (Lenis via lib/scroll — no GSAP).
//
// Two modes:
//  • default (section): a `scrollLength`-tall <section> whose sticky `.pin`
//    holds the video for the length of that section; progress is how far the
//    section has scrolled. `children` layer on top.
//  • fixed: the video is `position: fixed` behind ALL page content and scrubs
//    across the WHOLE document scroll. Drop one instance high in the tree (e.g.
//    _app) as a persistent backdrop; page sections float over it.
//
// Frame-by-frame scrubbing only works if the source is encoded with a keyframe
// on EVERY frame — otherwise the browser can only seek to sparse keyframes and
// the scrub looks steppy. Re-encode with `-g 1` (GOP of 1) and faststart:
//   ffmpeg -i in.mov -vf scale=1280:-2 -movflags faststart \
//     -vcodec libx264 -crf 23 -g 1 -pix_fmt yuv420p out.mp4
// Every frame is a keyframe, so keep the clip short and the resolution modest.

// How aggressively the shown frame chases the scroll target each frame.
// 1 = snap instantly to scroll position (steppy on fast wheels); lower = the
// footage eases toward the target for a smoother, more filmic scrub.
const SEEK_EASE = 0.12;

export default function VideoScrollBackground({
	src,
	poster,
	fixed = false,
	scrollLength = '400vh',
	className: sectionClassName,
	children,
}) {
	const sectionRef = useRef(null);
	const videoRef = useRef(null);

	useEffect(() => {
		const section = sectionRef.current;
		const video = videoRef.current;
		if (!section || !video) return undefined;

		// Never let it play; we only ever seek it.
		video.pause();
		video.autoplay = false;

		let duration = 0;
		let current = 0; // eased currentTime actually applied (seconds)
		let lastApplied = -1; // last value written to video.currentTime

		// Scroll → [0, 1]. In fixed mode that's progress through the whole page;
		// in section mode it's progress through this section's own scroll travel.
		const readProgress = () => {
			if (fixed) {
				const doc = document.documentElement;
				const travel = doc.scrollHeight - window.innerHeight;
				if (travel <= 0) return 0;
				return Math.min(1, Math.max(0, getScrollY() / travel));
			}
			const rect = section.getBoundingClientRect();
			const travel = section.offsetHeight - window.innerHeight;
			if (travel <= 0) return 0;
			return Math.min(1, Math.max(0, -rect.top / travel));
		};

		// Called every scroll frame (shares the app's Lenis rAF via onScrollFrame):
		// ease the displayed frame toward the scroll target and seek to it.
		const onFrame = () => {
			if (!duration) return;
			const target = readProgress() * duration;
			current += (target - current) * SEEK_EASE;
			if (Math.abs(target - current) < 0.01) current = target;
			// The Lenis rAF never idles, so onFrame fires continuously; skip the
			// seek when the eased frame hasn't moved to avoid kicking the media
			// seek pipeline every frame while the user is stationary.
			if (Math.abs(current - lastApplied) < 0.01) return;
			try {
				video.currentTime = current;
				lastApplied = current;
			} catch {
				/* not seekable yet — catch it on the next frame */
			}
		};

		const onMeta = () => {
			duration = video.duration || 0;
			onFrame();
		};

		if (video.readyState >= 1) onMeta();
		else video.addEventListener('loadedmetadata', onMeta);

		const unsubscribe = onScrollFrame(onFrame);
		section.classList.add(styles.loaded);

		return () => {
			unsubscribe();
			video.removeEventListener('loadedmetadata', onMeta);
		};
	}, [src, fixed]);

	const video = (
		<video
			ref={videoRef}
			className={cx('video')}
			// Frame scrubbing only — no autoplay/controls. muted + playsInline
			// keep iOS from taking the video fullscreen or blocking the source.
			muted
			playsInline
			preload="auto"
			poster={poster}
			aria-hidden="true"
			tabIndex={-1}
		>
			{src ? <source src={src} type="video/mp4" /> : null}
		</video>
	);

	// Fixed backdrop: a single full-viewport layer behind everything, no scroll
	// section of its own. GrainOverlay (max z-index) still composites over it.
	if (fixed) {
		return (
			<div
				ref={sectionRef}
				className={cx('component', 'fixed', sectionClassName)}
				aria-hidden="true"
			>
				{video}
			</div>
		);
	}

	return (
		<section
			ref={sectionRef}
			className={cx('component', sectionClassName)}
			style={{ height: scrollLength }}
		>
			<div className={cx('pin')}>
				{video}
				{children ? <div className={cx('overlay')}>{children}</div> : null}
			</div>
		</section>
	);
}
