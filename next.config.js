const { withFaust, getWpHostname } = require('@faustwp/core');
const { createSecureHeaders } = require('next-secure-headers');
const path = require('node:path');

const wordpressUrl = new URL(process.env.NEXT_PUBLIC_WORDPRESS_URL);

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
	reactStrictMode: true,
	// geist ships pre-built files that call next/font/local internally; Next's
	// font webpack transform skips node_modules unless told to process it here.
	// ogl ships raw ESM source; geist ships pre-built font files that call
	// next/font/local internally — both need Next to transpile them.
	transpilePackages: ['geist', 'ogl'],
	// ponytail: inotify doesn't reliably fire for edits on WSL2's /mnt/c
	// Windows-mounted filesystem, so webpack's dev-mode file watcher misses
	// changes without polling. Only affects local dev on this filesystem.
	webpack: (config, { dev }) => {
		// Next 16's sass-loader stopped resolving `@import 'styles/...'` against
		// includePaths alone; alias it explicitly so module SCSS files keep working.
		config.resolve.alias.styles = path.join(__dirname, 'styles');
		if (dev) {
			config.watchOptions = { poll: 800, aggregateTimeout: 300 };
		}
		// Import .glsl/.vert/.frag shader files as raw source strings so they can
		// be edited directly (e.g. lib/fragment.glsl) and hot-reload in dev.
		config.module.rules.push({
			test: /\.(glsl|vert|frag)$/,
			type: 'asset/source',
		});
		return config;
	},
	sassOptions: {
		includePaths: [__dirname, path.join(__dirname, 'node_modules')],
	},
	images: {
		remotePatterns: [
			{
				protocol: wordpressUrl.protocol.replace(':', ''),
				hostname: getWpHostname(),
				port: wordpressUrl.port,
				pathname: '/wp-content/uploads/**',
			},
		],
	},
	i18n: {
		locales: ['en'],
		defaultLocale: 'en',
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: createSecureHeaders({
					contentSecurityPolicy: {
						directives: {
							defaultSrc: ["'self'"],
							baseURI: ["'self'"],
							connectSrc: ["'self'", wordpressUrl.origin],
							fontSrc: ["'self'", 'data:'],
							formAction: ["'self'"],
							frameAncestors: ["'none'"],
							imgSrc: ["'self'", 'data:', 'blob:', wordpressUrl.origin],
							mediaSrc: ["'self'"],
							objectSrc: ["'none'"],
							scriptSrc: [
								"'self'",
								"'unsafe-inline'",
								...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
							],
							styleSrc: ["'self'", "'unsafe-inline'"],
						},
					},
					referrerPolicy: 'strict-origin-when-cross-origin',
					xssProtection: false,
				}),
			},
		];
	},
});
