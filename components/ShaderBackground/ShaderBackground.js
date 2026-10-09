import React, { useEffect, useRef } from 'react';
import styles from './ShaderBackground.module.scss';

// Generative backdrop: slow domain-warped noise drawn as thin contour lines
// (a "signal map"), tinted with the accent green and kept very dark so white
// text stays readable on top. The backdrop is fixed (no scroll coupling); the
// pointer adds a soft glow. No textures, no video, no extra dependency (ogl is already used by
// GrainOverlay). Prototype stand-in for VideoScrollBackground.
//
// ponytail: fixed 30fps / 0.75 dpr; add visibility/intersection pausing if it
// ever shows up in a perf profile.
const FRAG = /* glsl */ `
	precision highp float;
	uniform float uTime;
	uniform vec2 uResolution;
	uniform vec2 uMouse;
	uniform vec3 uColor;
	uniform float uStrength;
	varying vec2 vUv;

	float hash(vec2 p) {
		p = fract(p * vec2(123.34, 456.21));
		p += dot(p, p + 45.32);
		return fract(p.x * p.y);
	}

	float noise(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		f = f * f * (3.0 - 2.0 * f);
		return mix(
			mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
			mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
			f.y
		);
	}

	float fbm(vec2 p) {
		float v = 0.0;
		float a = 0.5;
		for (int i = 0; i < 4; i++) {
			v += a * noise(p);
			p = p * 2.02 + 7.3;
			a *= 0.5;
		}
		return v;
	}

	void main() {
		float aspect = uResolution.x / uResolution.y;
		vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 1.6;

		float t = uTime * 0.04;
		vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
		float h = fbm(p + 1.8 * q + vec2(0.0, t));

		// Contour lines: bright where h crosses each of N levels.
		float levels = 14.0;
		float d = abs(fract(h * levels) - 0.5);
		float line = 1.0 - smoothstep(0.0, 0.05, d);

		// Soft pointer glow so the field feels alive under the cursor.
		vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0) * 1.6;
		float glow = exp(-dot(p - m, p - m) * 3.0);

		float a = line * (0.5 + glow * 1.0) * uStrength;
		// Vignette keeps the edges (and the header/footer) quiet.
		a *= smoothstep(1.1, 0.2, length(vUv - 0.5) * 1.4);

		gl_FragColor = vec4(uColor * a, 1.0);
	}
`;

// Port of a Three.js reference: glowing wave lines, soft noise haze, sparse
// stars and a pointer glow. `uMono` collapses its pink/blue palette onto the
// accent colour so it matches the site; set mono={false} for the original hues.
const WAVES = /* glsl */ `
	precision highp float;
	uniform float uTime;
	uniform vec2 uResolution;
	uniform vec2 uMouse;
	uniform vec3 uColor;
	uniform float uStrength;
	uniform float uMono;
	varying vec2 vUv;

	mat2 rot(float a) {
		float s = sin(a);
		float c = cos(a);
		return mat2(c, -s, s, c);
	}
	float wave(vec2 p, float phase, float freq) {
		return sin(p.x * freq + phase) * 0.3 * sin(p.y * freq * 0.5 + phase * 0.7);
	}
	float glowLine(float dist, float thickness, float intensity) {
		return intensity * thickness / (abs(dist) + thickness * 0.5);
	}
	vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
	float snoise(vec2 v) {
		const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
		vec2 i = floor(v + dot(v, C.yy));
		vec2 x0 = v - i + dot(i, C.xx);
		vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
		vec4 x12 = x0.xyxy + C.xxzz;
		x12.xy -= i1;
		i = mod289(i);
		vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
		vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
		m = m * m;
		m = m * m;
		vec3 x = 2.0 * fract(p * C.www) - 1.0;
		vec3 h = abs(x) - 0.5;
		vec3 ox = floor(x + 0.5);
		vec3 a0 = x - ox;
		m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
		vec3 g;
		g.x = a0.x * x0.x + h.x * x0.y;
		g.yz = a0.yz * x12.xz + h.yz * x12.yw;
		return 130.0 * dot(m, g);
	}
	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
	}
	float starfield(vec2 uv, float time) {
		vec2 grid = floor(uv * 150.0);
		vec2 cell = fract(uv * 150.0) - 0.5;
		float star = hash(grid);
		if (star < 0.985) return 0.0;
		float twinkle = sin(time * 2.0 + grid.x + grid.y) * 0.5 + 0.5;
		return smoothstep(0.08, 0.0, length(cell)) * twinkle * (star - 0.985) * 100.0;
	}

	void main() {
		vec2 uv = (vUv - 0.5) * 2.0;
		uv.x *= uResolution.x / uResolution.y;
		vec2 uv0 = uv;
		vec3 col = vec3(0.0);
		float time = uTime * 0.4;

		col += (snoise(uv * 0.5 + time * 0.02) + 1.0) * 0.5 * vec3(0.05, 0.0, 0.1) * 0.3;

		vec2 mouseUv = (uMouse - 0.5) * 2.0;
		mouseUv.x *= uResolution.x / uResolution.y;
		float mouseDist = length(uv - mouseUv);
		uv += (mouseUv - uv) * (0.3 / (mouseDist + 0.5));
		float mouseGlow = 0.1 / (mouseDist + 0.1);
		mouseGlow *= (sin(uTime * 1.5) * 0.5 + 0.5) * 0.7 + 0.3;
		col += mouseGlow * vec3(1.0, 0.8, 1.0) * 0.15;

		uv *= rot(time * 0.05);
		float waveNoise = snoise(uv * 2.0 + time * 0.2) * 0.1;
		float c1 = sin(time * 0.3) * 0.5 + 0.5;
		float c2 = sin(time * 0.3 + 2.0) * 0.5 + 0.5;
		float c3 = sin(time * 0.3 + 4.0) * 0.5 + 0.5;

		float y1 = uv.y - wave(uv, time * 1.5, 2.0) + waveNoise;
		col += vec3(1.0, c1 * 0.5 + 0.1, c2 * 0.7 + 0.3) * glowLine(y1, 0.03, 0.8);
		float y2 = uv.y + 0.4 - wave(uv + vec2(1.0, 0.5), time * 1.2, 2.5) + waveNoise * 0.8;
		col += vec3(c2 * 0.3 + 0.1, c3 * 0.7 + 0.3, 1.0) * glowLine(y2, 0.03, 0.8);
		float y3 = uv.y - 0.4 - wave(uv + vec2(-0.5, 1.0), time * 1.8, 1.8) + waveNoise * 1.2;
		col += vec3(c1 * 0.7 + 0.3, c3 * 0.5 + 0.1, 1.0) * glowLine(y3, 0.03, 0.8);

		float dist = length(uv0);
		col += vec3(0.5, 0.7, 1.0) * abs(sin(dist * 4.0 - time * 2.0)) * exp(-dist * 0.5) * 0.3;
		col += starfield(uv0 * 2.0 + time * 0.01, uTime) * vec3(1.0, 0.9, 0.8) * 0.7;
		col += exp(-dist) * 0.3 * vec3(0.4, 0.5, 0.8);

		col *= smoothstep(0.0, 1.0, 1.0 - dist * 0.5);
		col = pow(col, vec3(0.95));

		// Mono: keep the light/dark structure, swap the hue for the accent.
		col = mix(col, uColor * dot(col, vec3(0.333)) * 1.6, uMono);
		gl_FragColor = vec4(col * uStrength, 1.0);
	}
`;

// Default brightness per variant (the waves are far hotter than the contours).
const STRENGTH = { contours: 0.6, waves: 0.35 };

export default function ShaderBackground({
	variant = 'contours',
	color = [0.0, 1.0, 0.255],
	strength = STRENGTH[variant],
	mono = true,
}) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return undefined;

		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		let renderer;
		let raf = 0;
		let cancelled = false;
		let onResize;
		let onMove;

		import('ogl')
			.then(({ Renderer, Program, Mesh, Triangle }) => {
				if (cancelled) return;
				renderer = new Renderer({ canvas, dpr: 0.75 });
				const gl = renderer.gl;
				gl.clearColor(0.04, 0.04, 0.04, 1);

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
					fragment: variant === 'waves' ? WAVES : FRAG,
					uniforms: {
						uTime: { value: 0 },
						uResolution: { value: [1, 1] },
						uMouse: { value: [0.5, 0.5] },
						uColor: { value: color },
						uStrength: { value: strength },
						uMono: { value: mono ? 1 : 0 },
					},
				});
				const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

				let target = [0.5, 0.5];
				onResize = () => {
					renderer.setSize(window.innerWidth, window.innerHeight);
					program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
				};
				onMove = (e) => {
					target = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
				};
				onResize();
				window.addEventListener('resize', onResize);
				window.addEventListener('pointermove', onMove, { passive: true });

				const interval = 1000 / 30;
				let last = -Infinity;
				const render = (t) => {
					if (cancelled) return;
					if (!reduce) raf = requestAnimationFrame(render);
					if (document.hidden || t - last < interval) return;
					last = t;
					const u = program.uniforms;
					// Eased pointer; the field itself stays fixed while the page scrolls.
					u.uMouse.value = [
						u.uMouse.value[0] + (target[0] - u.uMouse.value[0]) * 0.06,
						u.uMouse.value[1] + (target[1] - u.uMouse.value[1]) * 0.06,
					];
					u.uTime.value = reduce ? 0 : t * 0.001;
					try {
						renderer.render({ scene: mesh });
					} catch {
						cancelled = true; // lost context (HMR); stop quietly
					}
				};
				render(0);
			})
			.catch(() => {
				// WebGL unavailable: the page's black ground shows instead.
			});

		return () => {
			cancelled = true;
			if (raf) cancelAnimationFrame(raf);
			if (onResize) window.removeEventListener('resize', onResize);
			if (onMove) window.removeEventListener('pointermove', onMove);
		};
	}, [variant, color, strength, mono]);

	return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
