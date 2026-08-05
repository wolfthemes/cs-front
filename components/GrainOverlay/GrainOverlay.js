import React, { useEffect, useRef } from 'react';
import styles from './GrainOverlay.module.scss';

// Whole-page film-grain shader. A single fixed full-viewport canvas runs an
// animated noise fragment shader, blended over everything (mix-blend-mode in
// CSS) to give the page a grainy, shader feel — the signature of the Anatole
// Touvron look. It has no textures, so no CORS/image dependency; it just works.
//
// ogl is imported dynamically inside the effect so this stays client-only and
// never runs during SSR.
export default function GrainOverlay({ intensity = 0.5, fps = 24 }) {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return undefined;

		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let renderer;
		let raf = 0;
		let cancelled = false;
		let onResize;

		import('ogl')
			.then(({ Renderer, Program, Mesh, Triangle }) => {
				if (cancelled) return;

				renderer = new Renderer({
					canvas,
					alpha: true,
					// Grain reads great a touch chunky; cap the pixel ratio to keep it
					// cheap and to give the noise some visible size.
					dpr: 1,
				});
				const gl = renderer.gl;
				gl.clearColor(0, 0, 0, 0);

				const geometry = new Triangle(gl);
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
					fragment: /* glsl */ `
						precision highp float;
						uniform float uTime;
						uniform vec2 uResolution;
						uniform float uIntensity;
						varying vec2 vUv;

						float hash(vec2 p) {
							p = fract(p * vec2(123.34, 456.21));
							p += dot(p, p + 45.32);
							return fract(p.x * p.y);
						}

						void main() {
							// One noise sample per device pixel, reshuffled each frame.
							vec2 px = vUv * uResolution;
							float n = hash(px + fract(uTime) * 137.0);
							// Dark-based grain for a 'screen' (additive) blend: near-black
							// with speckle, so it ADDS faint noise to the black background
							// (an 'overlay' blend would leave pure black untouched).
							gl_FragColor = vec4(vec3(n * uIntensity), 1.0);
						}
					`,
					uniforms: {
						uTime: { value: 0 },
						uResolution: { value: [1, 1] },
						uIntensity: { value: intensity },
					},
				});
				const mesh = new Mesh(gl, { geometry, program });

				onResize = () => {
					renderer.setSize(window.innerWidth, window.innerHeight);
					program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
				};
				onResize();
				window.addEventListener('resize', onResize);

				// Throttle to ~`fps`: each redraw of this blended full-screen canvas
				// forces the browser to re-composite the whole page, so drawing fewer
				// grain frames is a large win (and 24fps reads as more filmic). Skip
				// entirely when the tab is hidden.
				const interval = 1000 / fps;
				let lastDraw = -Infinity;
				const render = (t) => {
					if (cancelled) return;
					if (!reduce) raf = requestAnimationFrame(render);
					if (document.hidden || t - lastDraw < interval) return;
					lastDraw = t;
					program.uniforms.uTime.value = t * 0.001;
					try {
						renderer.render({ scene: mesh });
					} catch {
						// Lost WebGL context (e.g. after an HMR reload) — stop quietly.
						cancelled = true;
					}
				};
				render(0);
			})
			.catch(() => {
				// WebGL unavailable — no grain, no harm.
			});

		return () => {
			cancelled = true;
			if (raf) cancelAnimationFrame(raf);
			if (onResize) window.removeEventListener('resize', onResize);
			// Note: we deliberately do NOT call WEBGL_lose_context here. This canvas
			// is the JSX-rendered element (reused across HMR/remounts); losing its
			// context would poison the next renderer built on it.
		};
	}, [intensity, fps]);

	return <canvas ref={canvasRef} className={styles.grain} aria-hidden="true" />;
}
