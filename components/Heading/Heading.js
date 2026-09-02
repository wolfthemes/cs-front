import React from 'react';

export default function Heading({ level = 'h1', children, className }) {
	return React.createElement(level, { className }, children);
}
