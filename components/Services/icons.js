// Small line icons for the Services page (24px grid, inherit currentColor).
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

export const MailIcon = () => (
	<svg {...base}>
		<rect x="3" y="5" width="18" height="14" rx="2" />
		<path d="m3.5 7 8.5 6 8.5-6" />
	</svg>
);

export const QuoteIcon = () => (
	<svg {...base}>
		<path d="M7 3h7l4 4v14H7z" />
		<path d="M14 3v4h4M10 12h5M10 16h5" />
	</svg>
);

export const RocketIcon = () => (
	<svg {...base}>
		<path d="M12 3c3 2 4.5 5 4.5 8.5L14 15h-4l-2.5-3.5C7.5 8 9 5 12 3Z" />
		<circle cx="12" cy="9.5" r="1.25" />
		<path d="M8 14.5 5.5 17l2 .5.5 2 2.5-2.5M16 14.5l2.5 2.5-2 .5-.5 2-2.5-2.5" />
	</svg>
);
