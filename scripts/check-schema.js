const fs = require('node:fs');
const path = require('node:path');

function loadLocalEnv() {
	const envPath = path.join(process.cwd(), '.env.local');
	if (!fs.existsSync(envPath)) return;

	for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
		const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
		if (match && !process.env[match[1]])
			process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
	}
}

async function main() {
	loadLocalEnv();
	const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
	if (!wordpressUrl) throw new Error('NEXT_PUBLIC_WORDPRESS_URL is not configured.');

	const response = await fetch(`${wordpressUrl.replace(/\/$/, '')}/graphql`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			query: 'query FrontendSchemaCheck { works(first: 1) { nodes { id } } }',
		}),
	});
	const result = await response.json();
	if (!response.ok || result.errors?.length) {
		const details =
			result.errors?.map(({ message }) => message).join('\n') || `HTTP ${response.status}`;
		throw new Error(
			`The WordPress GraphQL schema at ${wordpressUrl} is incompatible. ` +
				'Activate/register the Work post type with show_in_graphql enabled.\n' +
				details
		);
	}
}

main().catch((error) => {
	console.error(`\nSchema check failed:\n${error.message}\n`);
	process.exitCode = 1;
});
