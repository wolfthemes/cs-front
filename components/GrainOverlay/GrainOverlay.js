import React, { useEffect, useRef } from 'react';
import styles from './GrainOverlay.module.scss';

// Whole-page film-grain shader. A single fixed full-viewport canvas runs an
// animated noise fragment shader, blended over everything (mix-blend-mode in
// CSS) to give the page a grainy, shader feel — the signature of the Anatole
// Touvron look. It has no textures, so no CORS/image dependency; it just works.
//
// ogl is imported dynamically inside the effect so this stays client-only and
// never runs during SSR.
export default function GrainOverlay({ intensity = 0.5 }) {
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
							// Centre on 0.5 so an 'overlay' blend leaves mid-tones alone
							// and only adds the grain's deviation.
							float g = 0.5 + (n - 0.5) * uIntensity;
							gl_FragColor = vec4(vec3(g), 1.0);
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

				const render = (t) => {
					program.uniforms.uTime.value = t * 0.001;
					renderer.render({ scene: mesh });
					if (!reduce) raf = requestAnimationFrame(render);
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
			if (renderer) {
				const ext = renderer.gl.getExtension('WEBGL_lose_context');
				if (ext) ext.loseContext();
			}
		};
	}, [intensity]);

	return <canvas ref={canvasRef} className={styles.grain} aria-hidden="true" />;
}
