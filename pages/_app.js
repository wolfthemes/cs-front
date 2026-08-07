import '../faust.config';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import { FaustProvider } from '@faustwp/core';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare, GeistPixelGrid, GeistPixelCircle } from 'geist/font/pixel';
import { EB_Garamond } from 'next/font/google';
import { GrainOverlay } from '../components';
import { initSmoothScroll, resizeSmoothScroll } from '../lib/scroll';
import '@faustwp/core/dist/css/toolbar.css';
import '../styles/global.scss';

// EB Garamond, self-hosted via next/font (the serif used in the sibling
// constantin-saguin project). Exposed as --font-eb-garamond for accent copy.
const ebGaramond = EB_Garamond({
	subsets: ['latin'],
	weight: ['400', '500'],
	style: ['normal', 'italic'],
	display: 'swap',
	variable: '--font-eb-garamond',
});

// Expose every Geist family's CSS variable on the app wrapper so styles can
// reference them (--font-geist-sans / --font-geist-mono / --font-geist-pixel-*).
// Geist Sans is applied as the main font via `.app-shell` in styles/_base.scss.
const fontVariables = [
	GeistSans.variable,
	GeistMono.variable,
	GeistPixelSquare.variable,
	GeistPixelGrid.variable,
	GeistPixelCircle.variable,
	ebGaramond.variable,
].join(' ');

// Google Analytics (gtag.js). The measurement id comes from NEXT_PUBLIC_GA_ID,
// which is set only where analytics should run (Vercel Production). When it's
// absent — local dev, preview deploys — the tag isn't rendered at all, so no
// hits are sent. Loaded via next/script with `afterInteractive` so it doesn't
// block first paint; next/script also de-dupes it across client-side routes.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function MyApp({ Component, pageProps }) {
	const router = useRouter();

	useEffect(() => {
		initSmoothScroll();
	}, []);

	useEffect(() => {
		resizeSmoothScroll();
	}, [router.asPath]);

	return (
		<FaustProvider pageProps={pageProps}>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			{GA_ID && (
				<>
					<Script
						src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
						strategy="afterInteractive"
					/>
					<Script id="gtag-init" strategy="afterInteractive">
						{`
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', '${GA_ID}');
						`}
					</Script>
				</>
			)}
			<div className={`app-shell ${fontVariables}`}>
				<Component {...pageProps} key={router.asPath} />
				<GrainOverlay />
				<SpeedInsights />
			</div>
		</FaustProvider>
	);
}
