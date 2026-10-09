import { useState } from 'react';
import Head from 'next/head';
import { ShaderBackground, TrailBackground, VideoScrollBackground } from '../../components';

// Throwaway comparison route: http://localhost:3000/lab/bg
// Toggle between the generative shader and the statue video behind the same
// content (hero text + stack list) to judge mood, legibility and weight.
const COLUMNS = {
	'Architecture & Backend': [
		'Headless WordPress (Faust / Next.js)',
		'WPGraphQL, REST API',
		'OOP / PSR-4',
		'Composer',
	],
	'Infrastructure & DevOps': [
		'Linux / nginx',
		'Docker, WP-Env, WP VIP',
		'Bedrock',
		'CI/CD (GitHub Actions)',
	],
	'Frontend & Interaction': [
		'React / Next.js',
		'Gutenberg / FSE',
		'SCSS / CSS3',
		'Core Web Vitals',
	],
};

export default function BackgroundLab() {
	const [mode, setMode] = useState('trail');

	return (
		<main style={{ maxWidth: 1100, margin: '0 auto', padding: '8vh 5vw', minHeight: '300vh' }}>
			<Head>
				<title>Background lab</title>
			</Head>
			{mode === 'video' ? (
				<VideoScrollBackground fixed src="/video/hero-scroll.mp4" />
			) : mode === 'trail' ? (
				<TrailBackground />
			) : (
				<ShaderBackground key={mode} variant={mode} />
			)}
			<div style={{ position: 'fixed', top: 16, right: 16, display: 'flex', gap: 8, zIndex: 10 }}>
				{['trail', 'contours', 'waves', 'video'].map((m) => (
					<button
						key={m}
						type="button"
						onClick={() => setMode(m)}
						style={{
							padding: '0.4rem 0.9rem',
							borderRadius: 100,
							border: '1px solid rgba(255,255,255,0.35)',
							background: mode === m ? '#fff' : 'transparent',
							color: mode === m ? '#000' : '#fff',
							cursor: 'pointer',
						}}
					>
						{m}
					</button>
				))}
			</div>
			<h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: 1, margin: '0 0 0.3em' }}>
				Senior Web Engineer
			</h1>
			<p style={{ opacity: 0.7, maxWidth: 560, marginBottom: '12vh' }}>
				Move the pointer, scroll, and flip the toggle (trail / contours / waves / statue video).
				Prototype, not wired into the site.
			</p>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
					gap: '2rem',
				}}
			>
				{Object.entries(COLUMNS).map(([title, items]) => (
					<section key={title}>
						<h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{title}</h2>
						<ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
							{items.map((i) => (
								<li key={i}>{i}</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</main>
	);
}
