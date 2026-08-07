import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import { HoverDistortImage } from '../../components';

// Throwaway demo route: http://localhost:3000/lab/distort
// Left card is hover-only; right card also gets a live scroll-velocity skew fed
// through `velocityRef`, so you can feel both inputs the wolfthemes page uses.
// Same-origin images from public/gallery (no CORS taint on the WebGL texture).
const IMAGES = [
	{ src: '/gallery/aurenza--artistic-agency.jpg', w: 1707, h: 904, alt: 'aurenza — artistic agency' },
	{ src: '/gallery/sable--portfolio-vertical.jpg', w: 1600, h: 847, alt: 'sable — portfolio vertical' },
];

export default function DistortLab() {
	const velocityRef = useRef(0);

	// Feed wheel/scroll speed into the ref; decays back to 0 each frame.
	useEffect(() => {
		let raf;
		const decay = () => {
			velocityRef.current *= 0.9;
			raf = requestAnimationFrame(decay);
		};
		const onWheel = (e) => {
			velocityRef.current = Math.max(-1, Math.min(1, e.deltaY / 400));
		};
		window.addEventListener('wheel', onWheel, { passive: true });
		raf = requestAnimationFrame(decay);
		return () => {
			window.removeEventListener('wheel', onWheel);
			cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<main style={{ maxWidth: 1100, margin: '0 auto', padding: '8vh 5vw' }}>
			<Head>
				<title>Hover-distort lab</title>
			</Head>
			<h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '0.25em' }}>
				OGL hover distortion
			</h1>
			<p style={{ opacity: 0.6, marginBottom: '4vh' }}>
				Move the pointer over each image. Scroll to feel the velocity skew on the
				right one. Prototype — not wired into the site.
			</p>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
					gap: '2rem',
				}}
			>
				<figure style={{ margin: 0 }}>
					<HoverDistortImage
						src={IMAGES[0].src}
						alt={IMAGES[0].alt}
						width={IMAGES[0].w}
						height={IMAGES[0].h}
					/>
					<figcaption style={{ opacity: 0.5, marginTop: '0.75rem' }}>
						Hover only
					</figcaption>
				</figure>
				<figure style={{ margin: 0 }}>
					<HoverDistortImage
						src={IMAGES[1].src}
						alt={IMAGES[1].alt}
						width={IMAGES[1].w}
						height={IMAGES[1].h}
						velocityRef={velocityRef}
					/>
					<figcaption style={{ opacity: 0.5, marginTop: '0.75rem' }}>
						Hover + scroll velocity
					</figcaption>
				</figure>
			</div>
		</main>
	);
}
