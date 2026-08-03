import '../faust.config';
import React from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare, GeistPixelGrid, GeistPixelCircle } from 'geist/font/pixel';
import { EB_Garamond } from 'next/font/google';
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

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <FaustProvider pageProps={pageProps}>
      <div className={`app-shell ${fontVariables}`}>
        <Component {...pageProps} key={router.asPath} />
      </div>
    </FaustProvider>
  );
}
