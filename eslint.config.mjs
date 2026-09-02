import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
	...nextVitals,
	prettier,
	globalIgnores(['.next/**', 'node_modules/**']),
	{
		// ponytail: eslint-config-next 16 adds this rule; it flags every
		// measure-DOM-then-reveal effect (HomeHero/Statement/Playground/Contact
		// reduced-motion guards and line-measurement reveals) as a perf risk.
		// These are one-shot initial-mount reveals, not update loops — rewriting
		// them to avoid the warning would touch animation timing across four
		// components for no behavior change. Revisit if it starts flagging a
		// genuine render-thrash bug.
		rules: { 'react-hooks/set-state-in-effect': 'off' },
	},
]);
