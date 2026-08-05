const { withFaust, getWpHostname } = require('@faustwp/core');
const { createSecureHeaders } = require('next-secure-headers');

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
		includePaths: ['node_modules'],
	},
	images: {
		domains: [getWpHostname()],
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
					xssProtection: false,
				}),
			},
		];
	},
});
