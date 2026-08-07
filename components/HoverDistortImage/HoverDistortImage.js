import React, { useEffect, useRef } from 'react';
import className from 'classnames/bind';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import styles from './HoverDistortImage.module.scss';

let cx = className.bind(styles);

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fullscreen-triangle vertex pass: `position` is already in clip space, so we
// skip cameras/projection entirely and just forward the [0,1] uv.
const VERT = /* glsl */ `
	attribute vec2 uv;
	attribute vec2 position;
	varying vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = vec4(position, 0.0, 1.0);
	}
`;

// The whole effect. Two inputs drive it:
//   uHover    — 0..1, eased toward 1 while the pointer is over the image.
//   uMouse    — pointer position in uv space (0..1), y flipped to match WebGL.
//   uVelocity — signed scroll/marquee speed, for the drag-skew (0 when unused).
// A radial falloff around the pointer pushes the uv toward the cursor and adds
// a small chromatic split, so texels smear and colour-fringe under the mouse.
const FRAG = /* glsl */ `
	precision highp float;
	uniform sampler2D tMap;
	uniform vec2 uSize;      // canvas px, for aspect-correct distance
	uniform vec2 uMouse;
	uniform float uHover;
	uniform float uVelocity;
	uniform float uTime;
	varying vec2 vUv;

	void main() {
		vec2 uv = vUv;
		float aspect = uSize.x / uSize.y;

		// Aspect-corrected distance from the pointer.
		vec2 d = uv - uMouse;
		d.x *= aspect;
		float dist = length(d);

		// Soft radial bump under the cursor.
		float falloff = smoothstep(0.45, 0.0, dist) * uHover;

		// Pull uv toward the pointer + a gentle ripple so it feels liquid.
		vec2 dir = normalize(d + 1e-4);
		float ripple = sin(dist * 22.0 - uTime * 4.0) * 0.5 + 0.5;
		vec2 offset = dir * falloff * 0.06 * ripple;

		// Marquee/scroll drag: horizontal skew that grows away from center.
		offset.x += uVelocity * (uv.y - 0.5) * 0.35;

		// Chromatic split scaled by the same falloff (0 at rest = crisp image).
		float split = falloff * 0.02 + abs(uVelocity) * 0.01;
		float r = texture2D(tMap, uv - offset + dir * split).r;
		float g = texture2D(tMap, uv - offset).g;
		float b = texture2D(tMap, uv - offset - dir * split).b;

		gl_FragColor = vec4(r, g, b, 1.0);
	}
`;

const lerp = (a, b, t) => a + (b - a) * t;

// A single image rendered on a WebGL quad so the pointer can warp it. The plain
// <img> stays in the DOM for layout, SSR and no-JS/reduced-motion — the canvas
// overlays it and takes over painting only once the texture is ready. Pass a
// `velocityRef` (a ref whose `.current` is a signed speed) to also feed a
// scroll/marquee drag-skew into the shader; omit it for hover-only.
export default function HoverDistortImage({
	src,
	alt = '',
	width,
	height,
	velocityRef = null,
	className: cn,
}) {
	const wrapRef = useRef(null);
	const imgRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		if (prefersReducedMotion()) return undefined;
		const wrap = wrapRef.current;
		const canvas = canvasRef.current;
		if (!wrap || !canvas) return undefined;

		const renderer = new Renderer({
			canvas,
			alpha: true,
			dpr: Math.min(window.devicePixelRatio || 1, 2),
			width: wrap.clientWidth,
			height: wrap.clientHeight,
		});
		const gl = renderer.gl;

		const texture = new Texture(gl, {
			generateMipmaps: false,
			minFilter: gl.LINEAR,
			magFilter: gl.LINEAR,
		});

		const program = new Program(gl, {
			vertex: VERT,
			fragment: FRAG,
			uniforms: {
				tMap: { value: texture },
				uSize: { value: [wrap.clientWidth, wrap.clientHeight] },
				uMouse: { value: [0.5, 0.5] },
				uHover: { value: 0 },
				uVelocity: { value: 0 },
				uTime: { value: 0 },
			},
		});
		const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

		// Load the bitmap, then reveal the canvas over the <img>.
		let disposed = false;
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = src;
		const onLoad = () => {
			if (disposed) return;
			texture.image = img;
			canvas.classList.add(styles.ready);
		};
		img.decode ? img.decode().then(onLoad, onLoad) : (img.onload = onLoad);

		// Pointer state; uHover eases so entering/leaving is smooth.
		let hoverTarget = 0;
		const target = { mx: 0.5, my: 0.5 };

		const onMove = (e) => {
			const r = wrap.getBoundingClientRect();
			target.mx = (e.clientX - r.left) / r.width;
			target.my = 1 - (e.clientY - r.top) / r.height; // flip for WebGL
		};
		const onEnter = () => {
			hoverTarget = 1;
		};
		const onLeave = () => {
			hoverTarget = 0;
		};
		wrap.addEventListener('pointermove', onMove);
		wrap.addEventListener('pointerenter', onEnter);
		wrap.addEventListener('pointerleave', onLeave);

		const ro = new ResizeObserver(() => {
			renderer.setSize(wrap.clientWidth, wrap.clientHeight);
			program.uniforms.uSize.value = [wrap.clientWidth, wrap.clientHeight];
		});
		ro.observe(wrap);

		let raf = 0;
		let visible = false;
		const startTime = performance.now();
		const render = (now) => {
			const u = program.uniforms;
			u.uHover.value = lerp(u.uHover.value, hoverTarget, 0.08);
			u.uMouse.value[0] = lerp(u.uMouse.value[0], target.mx, 0.1);
			u.uMouse.value[1] = lerp(u.uMouse.value[1], target.my, 0.1);
			u.uVelocity.value = velocityRef ? lerp(u.uVelocity.value, velocityRef.current || 0, 0.1) : 0;
			u.uTime.value = (now - startTime) / 1000;
			renderer.render({ scene: mesh });

			// Don't burn GPU when scrolled out of view or on a hidden tab; the
			// observer / visibilitychange / pointerenter restart the loop.
			if (!visible || document.hidden) {
				raf = 0;
				return;
			}
			raf = requestAnimationFrame(render);
		};
		const start = () => {
			if (!raf && !disposed) raf = requestAnimationFrame(render);
		};

		const io = new IntersectionObserver(
			(entries) => {
				visible = entries[0].isIntersecting;
				if (visible && !document.hidden) start();
			},
			{ rootMargin: '200px' }
		);
		io.observe(wrap);
		const onVisibility = () => {
			if (!document.hidden && visible) start();
		};
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			disposed = true;
			if (raf) cancelAnimationFrame(raf);
			io.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			ro.disconnect();
			wrap.removeEventListener('pointermove', onMove);
			wrap.removeEventListener('pointerenter', onEnter);
			wrap.removeEventListener('pointerleave', onLeave);
			const ext = gl.getExtension('WEBGL_lose_context');
			if (ext) ext.loseContext();
		};
	}, [src, velocityRef]);

	return (
		<div
			ref={wrapRef}
			className={cx('wrap', cn)}
			style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }}
		>
			<img
				ref={imgRef}
				className={cx('img')}
				src={src}
				alt={alt}
				width={width}
				height={height}
				loading="lazy"
				draggable={false}
			/>
			<canvas ref={canvasRef} className={cx('canvas')} aria-hidden="true" />
		</div>
	);
}
