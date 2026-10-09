// Downloads a square-ish elevation grid (OpenTopoData EU-DEM 25m, free, no key, 1 req/s) and writes
// public/data/heightmap.json for TrailBackground.
//   node scripts/gen-heightmap.mjs [lat] [lon] [spanKm] [size]
// Default: the Grand Ballon, Vosges. Pass your village's lat/lon to centre on it.
import { writeFile } from 'node:fs/promises';

const [lat = 47.9, lon = 7.1, spanKm = 36, size = 80] = process.argv.slice(2).map(Number);
const dLat = spanKm / 111 / 2;
const dLon = spanKm / (111 * Math.cos((lat * Math.PI) / 180)) / 2;

const points = [];
for (let y = 0; y < size; y++) {
	for (let x = 0; x < size; x++) {
		points.push([
			+(lat + dLat - (2 * dLat * y) / (size - 1)).toFixed(5), // north at the top row
			+(lon - dLon + (2 * dLon * x) / (size - 1)).toFixed(5),
		]);
	}
}

const elevations = [];
for (let i = 0; i < points.length; i += 100) {
	const locations = points
		.slice(i, i + 100)
		.map((p) => p.join(','))
		.join('|');
	for (let attempt = 0; ; attempt++) {
		const res = await fetch(`https://api.opentopodata.org/v1/eudem25m?locations=${locations}`);
		if (res.ok) {
			// null = outside the dataset (sea, border): treat as 0.
			elevations.push(...(await res.json()).results.map((r) => r.elevation ?? 0));
			break;
		}
		if (attempt > 4) throw new Error(`OpenTopoData ${res.status}`);
		await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
	}
	await new Promise((r) => setTimeout(r, 1100));
}

const min = Math.min(...elevations);
const max = Math.max(...elevations);
const data = elevations.map((e) => Math.round(((e - min) / (max - min)) * 255));
await writeFile(
	new URL('../public/data/heightmap.json', import.meta.url),
	JSON.stringify({ w: size, h: size, min, max, center: [lat, lon], spanKm, data })
);
console.log(`ok ${size}x${size}, ${min}-${max} m`);
