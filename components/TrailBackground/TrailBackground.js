import React, { useEffect, useRef } from 'react';
import styles from './TrailBackground.module.scss';
import { getScrollY } from '../../lib/scroll';

// Fixed topographic map of real terrain (public/data/heightmap.json, made by
// scripts/gen-heightmap.mjs) with a hiking route (public/data/trail.json) that
// draws itself as the page scrolls: start at the top of the page, finish at the
// bottom. The map never moves, only the trail does, so scrolling stays calm. The
// whole route is framed on the right of the screen, ending above the footer, and
// the light warms from sage to amber as you climb. Waypoint rings mark
// 20/45/70/100% of the way.
//
// ponytail: trail.json was traced by hand from a gpx.studio screenshot (good to a
// few hundred metres). Replace its points with the real GPX [lat, lon] list for
// exactness; heightmap.json must be generated around the same centre.
const N = 128; // route samples (also the shader's loop bound)
// Section waypoints at 20 / 45 / 70 % of the path (the summit is the 4th).
const WAYPOINTS = [0.2, 0.45, 0.7].map((f) => Math.round(f * (N - 1)));

// ogl compiles this as ESSL 1.00 even on WebGL2: no derivatives (fwidth), and
// uniform arrays may only be indexed by loop counters / constants.
const FRAG = /* glsl */ `precision highp float;
	uniform sampler2D uMap;
	uniform vec2 uRes;
	uniform vec2 uSize;
	uniform vec2 uCenter;
	uniform float uZoom;
	uniform float uRange;
	uniform float uProgress;
	uniform float uStrength;
	uniform vec2 uPath[${N}];
	varying vec2 vUv;

	float texel(vec2 i) {
		vec2 c = clamp(i, vec2(0.0), uSize - 1.0);
		return texture2D(uMap, (c + 0.5) / uSize).r;
	}

	// Bilinear with smoothstep weights: C1-continuous, so contours stay round.
	float baseHeight(vec2 uv) {
		vec2 st = uv * uSize - 0.5;
		vec2 i = floor(st);
		vec2 f = fract(st);
		f = f * f * (3.0 - 2.0 * f);
		return mix(
			mix(texel(i), texel(i + vec2(1.0, 0.0)), f.x),
			mix(texel(i + vec2(0.0, 1.0)), texel(i + vec2(1.0, 1.0)), f.x),
			f.y
		);
	}

	float hash(vec2 p) {
		p = fract(p * vec2(123.34, 456.21));
		p += dot(p, p + 45.32);
		return fract(p.x * p.y);
	}
	float noise(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		f = f * f * (3.0 - 2.0 * f);
		return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
	}

	// x: distance to segment ab, y: position along it (0..1)
	vec2 seg(vec2 p, vec2 a, vec2 b) {
		vec2 pa = p - a;
		vec2 ba = b - a;
		float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);
		return vec2(length(pa - ba * h), h);
	}

	// aa = how much v changes per pixel (replaces fwidth).
	float lineAA(float v, float aa, float width) {
		float d = min(fract(v), 1.0 - fract(v));
		return 1.0 - smoothstep(0.0, max(aa * width, 1e-3), d);
	}

	float height(vec2 p) {
		return baseHeight(p) + (noise(p * uSize * 0.9) - 0.5) * 0.008;
	}

	float ring(float d, float r) {
		return smoothstep(r + 1.5, r + 0.5, d) - smoothstep(r - 0.5, r - 1.5, d);
	}

	void main() {
		float aspect = uRes.x / uRes.y;
		vec2 q = (vUv - 0.5) * vec2(aspect, 1.0);
		float L = max(aspect, 1.0) * uZoom;
		vec2 p = vec2(uCenter.x + q.x / L, uCenter.y - q.y / L);
		float px = 1.0 / (uRes.y * L); // one device pixel in map units

		// Terrain: real heights plus a little fine detail so contours feel natural.
		float h = height(p);
		float k = uRange / 40.0;
		float v = h * k; // minor contour every 40 m
		float aa = (abs(height(p + vec2(px, 0.0)) - height(p - vec2(px, 0.0))) +
			abs(height(p + vec2(0.0, px)) - height(p - vec2(0.0, px)))) * 0.5 * k;
		float minor = lineAA(v, aa, 1.1);
		float major = lineAA(v / 5.0, aa / 5.0, 1.8); // every 200 m
		// Nearly flat ground (plains) only has quantisation noise: fade it out.
		float relief = smoothstep(0.004, 0.03, aa);
		float contour = max(minor * 0.32, major * 0.85) * relief;

		// Light warms from sage to amber with scroll, summit first.
		vec3 sage = vec3(0.42, 0.62, 0.5);
		vec3 amber = vec3(1.0, 0.74, 0.38);
		float warm = clamp(uProgress * (0.25 + h * 1.1), 0.0, 1.0);
		vec3 lineCol = mix(sage, amber, warm);

		vec3 col = vec3(0.039) + vec3(0.0, 0.03, 0.02) * h;
		col += lineCol * contour * uStrength;

		// Trail: faint dashed route ahead, solid amber line behind.
		float tp = uProgress * ${(N - 1).toFixed(1)};
		float dAll = 1e3;
		float dDone = 1e3;
		float dashAlong = 0.0;
		float wp = 0.0;
		vec2 head = uPath[0];
		for (int i = 0; i < ${N - 1}; i++) {
			float fi = float(i);
			vec2 a = uPath[i];
			vec2 b = uPath[i + 1];
			vec2 s = seg(p, a, b);
			if (s.x < dAll) {
				dAll = s.x;
				dashAlong = (fi + s.y) / ${(N - 1).toFixed(1)};
			}
			if (fi < tp) {
				vec2 e = seg(p, a, mix(a, b, clamp(tp - fi, 0.0, 1.0)));
				dDone = min(dDone, e.x);
				head = mix(a, b, clamp(tp - fi, 0.0, 1.0));
			}
			// Section waypoints (summit handled below).
			if (${WAYPOINTS.map((i) => `i == ${i}`).join(' || ')}) {
				float d = length(p - a) / px;
				wp = max(wp, max(ring(d, 8.0) * 0.8, (1.0 - smoothstep(3.0, 4.0, d)) * step(fi, tp)));
			}
		}
		{
			vec2 top = uPath[${N - 1}];
			float d = length(p - top) / px;
			wp = max(wp, max(ring(d, 8.0) * 0.8, (1.0 - smoothstep(3.0, 4.0, d)) * step(${(N - 1).toFixed(1)}, tp)));
		}
		float dash = step(0.5, fract(dashAlong * 260.0));
		float ahead = (1.0 - smoothstep(px * 0.6, px * 1.4, dAll)) * dash * 0.35;
		float done = 1.0 - smoothstep(px * 0.9, px * 1.9, dDone);
		float glow = exp(-dDone / (px * 9.0)) * 0.12;
		col += vec3(1.0, 0.86, 0.6) * ahead;
		col = mix(col, vec3(1.0, 0.78, 0.42), done);
		col += amber * glow;

		// Waypoints (sections) and the walker (computed in the loop above).
		col = mix(col, vec3(1.0, 0.82, 0.5), wp);
		float hd = length(p - head) / px;
		col += vec3(1.0, 0.9, 0.7) * (ring(hd, 11.0) * 0.6 + (1.0 - smoothstep(4.0, 5.5, hd)));

		// Quiet edges so the header/footer and text stay readable.
		col *= smoothstep(1.25, 0.35, length(vUv - 0.5) * 1.5);
		gl_FragColor = vec4(col, 1.0);
	}
`;

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Two 3x3 box-blur passes: rounder, calmer contours than the raw 450 m grid.
function smooth({ w, h, data }) {
	let src = data;
	for (let pass = 0; pass < 2; pass++) {
		const out = new Array(src.length);
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				let sum = 0;
				for (let dy = -1; dy <= 1; dy++) {
					for (let dx = -1; dx <= 1; dx++) {
						sum += src[clamp(y + dy, 0, h - 1) * w + clamp(x + dx, 0, w - 1)];
					}
				}
				out[y * w + x] = sum / 9;
			}
		}
		src = out;
	}
	return src;
}

// public/data/trail.json holds the route as [lat, lon] points. Convert to map
// coords (0..1, v = 0 at the north edge), the inverse of gen-heightmap.mjs.
function toMapUv(map, [lat, lon]) {
	const [lat0, lon0] = map.center;
	const kmPerDegLon = 111 * Math.cos((lat0 * Math.PI) / 180);
	return [0.5 + ((lon - lon0) * kmPerDegLon) / map.spanKm, 0.5 - ((lat - lat0) * 111) / map.spanKm];
}

// One Chaikin corner-cutting pass: rounds the hand-traced corners.
function chaikin(points) {
	const out = [points[0]];
	for (let i = 0; i < points.length - 1; i++) {
		const [a, b] = [points[i], points[i + 1]];
		out.push(
			[a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25],
			[a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]
		);
	}
	out.push(points[points.length - 1]);
	return out;
}

// Resample a polyline to n evenly spaced points (flat [x, y, x, y, ...]).
function resample(points, n) {
	const lengths = [0];
	for (let i = 1; i < points.length; i++) {
		lengths.push(
			lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
		);
	}
	const total = lengths[lengths.length - 1];
	const out = [];
	let j = 1;
	for (let k = 0; k < n; k++) {
		const target = (k / (n - 1)) * total;
		while (j < points.length - 1 && lengths[j] < target) j++;
		const span = lengths[j] - lengths[j - 1] || 1;
		const f = clamp((target - lengths[j - 1]) / span, 0, 1);
		out.push(
			points[j - 1][0] + (points[j][0] - points[j - 1][0]) * f,
			points[j - 1][1] + (points[j][1] - points[j - 1][1]) * f
		);
	}
	return out;
}

const TOP_MARGIN = 0.11; // clear space above the route (fraction of screen height)
const RIGHT_BIAS = 0.12; // how far right of centre the route sits (fraction of screen width)

// Frame the whole route on screen: as large as fits, kept right of the text, and
// ending above the footer (footerFrac = footer height / viewport) so the last
// waypoint is never hidden. Returns the shader's zoom and map centre.
function frameRoute(route, aspect, footerFrac) {
	let minU = Infinity;
	let maxU = -Infinity;
	let minV = Infinity;
	let maxV = -Infinity;
	for (let i = 0; i < route.length; i += 2) {
		minU = Math.min(minU, route[i]);
		maxU = Math.max(maxU, route[i]);
		minV = Math.min(minV, route[i + 1]);
		maxV = Math.max(maxV, route[i + 1]);
	}
	const bottom = Math.max(0.11, footerFrac + 0.06);
	// Never show more than the map: visW = aspect / L must stay below 1.
	const L = Math.max(
		Math.min(
			(1 - TOP_MARGIN - bottom) / (maxV - minV), // fit the height
			(aspect * 0.84) / (maxU - minU) // fit the width (matters on portrait)
		),
		aspect / 0.98
	);
	const visW = aspect / L;
	const visH = 1 / L;
	const half = (maxU - minU) / visW / 2 + 0.06;
	const screenX = clamp(0.5 + RIGHT_BIAS, half, 1 - half);
	const screenY = (TOP_MARGIN + 1 - bottom) / 2;
	return {
		zoom: L / Math.max(aspect, 1),
		center: [
			clamp((minU + maxU) / 2 - (screenX - 0.5) * visW, visW / 2, 1 - visW / 2),
			clamp((minV + maxV) / 2 - (screenY - 0.5) * visH, visH / 2, 1 - visH / 2),
		],
	};
}

export default function TrailBackground({ strength = 0.55 }) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return undefined;

		let renderer;
		let raf = 0;
		let cancelled = false;
		let onResize;

		Promise.all([
			import('ogl'),
			fetch('/data/heightmap.json').then((r) => r.json()),
			fetch('/data/trail.json').then((r) => r.json()),
		])
			.then(([{ Renderer, Program, Mesh, Triangle, Texture }, raw, trail]) => {
				if (cancelled) return;
				const map = { ...raw, data: smooth(raw) };
				let line = trail.points.map((point) => toMapUv(map, point));
				line = chaikin(chaikin(line));
				const route = resample(line, N);
				renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 1.5) });
				const gl = renderer.gl;

				const rgba = new Uint8Array(map.w * map.h * 4);
				map.data.forEach((val, i) => {
					rgba[i * 4] = Math.round(val);
					rgba[i * 4 + 3] = 255;
				});
				const texture = new Texture(gl, {
					image: rgba,
					width: map.w,
					height: map.h,
					generateMipmaps: false,
					minFilter: gl.NEAREST,
					magFilter: gl.NEAREST,
					flipY: false,
				});

				const program = new Program(gl, {
					vertex: /* glsl */ `
						attribute vec2 uv;
						attribute vec2 position;
						varying vec2 vUv;
						void main() {
							vUv = uv;
							gl_Position = vec4(position, 0.0, 1.0);
						}
					`,
					fragment: FRAG,
					uniforms: {
						uMap: { value: texture },
						uRes: { value: [1, 1] },
						uSize: { value: [map.w, map.h] },
						uCenter: { value: [0.5, 0.5] },
						uZoom: { value: 1 },
						uRange: { value: map.max - map.min },
						uProgress: { value: 0 },
						uStrength: { value: strength },
						uPath: { value: route },
					},
				});
				const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
				const u = program.uniforms;

				// Rebuild the route for the viewport (framing depends on aspect ratio).
				let dirty = true;
				let footerH = 0;
				onResize = () => {
					renderer.setSize(window.innerWidth, window.innerHeight);
					footerH = document.querySelector('footer')?.offsetHeight ?? 0;
					const { zoom, center } = frameRoute(
						route,
						window.innerWidth / window.innerHeight,
						footerH / window.innerHeight
					);
					u.uRes.value = [gl.canvas.width, gl.canvas.height];
					u.uZoom.value = zoom;
					u.uCenter.value = center;
					dirty = true;
				};
				onResize();
				window.addEventListener('resize', onResize);
				// Fonts change the footer height; reframe once they land.
				document.fonts?.ready.then(() => !cancelled && onResize());

				let progress = 0;
				const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
				const frame = () => {
					if (cancelled) return;
					raf = requestAnimationFrame(frame);
					if (document.hidden) return;
					// Reach the summit when the footer is about to enter the screen.
					const max = document.documentElement.scrollHeight - window.innerHeight - footerH;
					const target = max > 0 ? clamp(getScrollY() / max, 0, 1) : 0;
					progress = reduce ? target : progress + (target - progress) * 0.1;
					if (Math.abs(target - progress) < 1e-4) progress = target;
					// Only redraw when something changed (static map, no idle GPU cost).
					if (!dirty && Math.abs(u.uProgress.value - progress) < 1e-5) return;
					dirty = false;
					u.uProgress.value = progress;
					try {
						renderer.render({ scene: mesh });
					} catch {
						cancelled = true; // lost context (HMR); stop quietly
					}
				};
				frame();
			})
			.catch((error) => {
				// No WebGL or no heightmap: the page's black ground shows instead.
				console.warn('TrailBackground disabled:', error);
			});

		return () => {
			cancelled = true;
			if (raf) cancelAnimationFrame(raf);
			if (onResize) window.removeEventListener('resize', onResize);
		};
	}, [strength]);

	return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
