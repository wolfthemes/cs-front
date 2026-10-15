// Small line icons for the Engineering page (24px grid, inherit currentColor).
const base = {
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.5,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
	'aria-hidden': true,
};

export const LayersIcon = () => (
	<svg {...base}>
		<path d="m12 3 9 5-9 5-9-5z" />
		<path d="m3 12.5 9 5 9-5M3 17l9 5 9-5" />
	</svg>
);

export const GaugeIcon = () => (
	<svg {...base}>
		<path d="M4 16a8 8 0 1 1 16 0" />
		<path d="m12 16 4-5" />
		<circle cx="12" cy="16" r="1" />
	</svg>
);

export const PipelineIcon = () => (
	<svg {...base}>
		<circle cx="6" cy="6" r="2" />
		<circle cx="6" cy="18" r="2" />
		<circle cx="18" cy="8" r="2" />
		<path d="M6 8v8M18 10c0 5-6 6-10 7" />
	</svg>
);

export const PackageIcon = () => (
	<svg {...base}>
		<path d="m12 3-8 4v10l8 4 8-4V7z" />
		<path d="m4 7 8 4 8-4M12 11v10" />
	</svg>
);
