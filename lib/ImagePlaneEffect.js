// Reusable WebGL image-plane effect (ogl-based).
//
// Turns every matching <img> inside a container into a textured WebGL plane on
// an overlay canvas, synced to the image's live bounding rect each frame — so
// it follows whatever CSS transform is moving that image (the marquee, a
// slider, …) without being wired into that code. The fragment shader is the
// user-authored lib/fragment.glsl (mouse-circle-gated chromatic aberration by
// velocity + film grain); edit that file to tune the look.
//
// The source <img> elements are hidden (opacity 0) once the GL layer is ready,
// and restored on dispose, so no-WebGL / reduced-motion callers can skip this
// and keep the plain images. On any render error (e.g. a CORS-tainted texture)
// it disposes itself and the plain images stay.
//
// ogl and the .glsl are imported here (not at a component top level) so they
// only load when a caller dynamically imports this module on the client.

import { Renderer, Program, Mesh, Plane, Texture, Transform } from 'ogl';
import fragment from './fragment.glsl';

// Positions each plane in clip space from its pixel rect and passes vUv through.
// A gentle scroll-velocity curve bows the plane vertically.
const VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;

  uniform vec4 uRect;        // x, y (top-left px, relative to canvas), w, h
  uniform vec2 uCanvas;      // canvas css px
  uniform float uScrollVelo; // signed scroll velocity

  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec2 p = position.xy + 0.5;                // 0..1
    float curve = sin(p.x * 3.14159265) * uScrollVelo * 26.0; // px

    vec2 posPx = uRect.xy + p * uRect.zw;
    posPx.y += curve;

    vec2 clip = posPx / uCanvas * 2.0 - 1.0;
    clip.y = -clip.y;
    gl_Position = vec4(clip, 0.0, 1.0);
  }
`;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default class ImagePlaneEffect {
	constructor(container, options = {}) {
		this.container = container;
		this.imgs = Array.from(container.querySelectorAll(options.selector || 'img'));
		this.velEase = options.velEase ?? 0.14;
		this.hoverEase = options.hoverEase ?? 0.1;
		// Converts px-per-frame rect movement into the uv-space velocity the shader
		// consumes; higher = more chromatic aberration for the same motion.
		this.velGain = options.velGain ?? 1.0;
		// Where to load each plane's texture from. Cross-origin callers (WordPress
		// media) can route through a same-origin URL to avoid a CORS-tainted
		// texture. Defaults to the img's own src (fine for same-origin/local).
		this.textureSrc = options.textureSrc || ((img) => img.currentSrc || img.src);

		this.planes = [];
		this.mouse = { x: -1, y: -1 }; // px relative to canvas
		this.raf = 0;
		this.amount = 0; // grain seed / time
		this.disposed = false;

		if (!this.imgs.length) return;

		try {
			this._init();
		} catch (err) {
			this.dispose();
			// eslint-disable-next-line no-console
			console.warn('ImagePlaneEffect: WebGL init failed, falling back.', err);
		}
	}

	_init() {
		this.renderer = new Renderer({
			alpha: true,
			premultipliedAlpha: false,
			dpr: Math.min(window.devicePixelRatio || 1, 2),
		});
		this.gl = this.renderer.gl;
		this.gl.clearColor(0, 0, 0, 0);

		this.canvas = this.gl.canvas;
		Object.assign(this.canvas.style, {
			position: 'absolute',
			inset: '0',
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
			zIndex: '0',
		});
		this.container.appendChild(this.canvas);

		this.scene = new Transform();
		this.geometry = new Plane(this.gl);

		this.imgs.forEach((img) => {
			const texture = new Texture(this.gl, { generateMipmaps: false });
			const program = new Program(this.gl, {
				vertex: VERT,
				fragment,
				transparent: true,
				// The vertex flips clip.y (top-left origin), which reverses triangle
				// winding — so without disabling culling the planes are back-faced
				// and never drawn (images vanish).
				cullFace: false,
				uniforms: {
					tMap: { value: texture },
					uRect: { value: [0, 0, 1, 1] },
					uCanvas: { value: [1, 1] },
					// Aspect vector so the mouse circle reads round in screen space.
					uResolution: { value: [1, 1] },
					uMouse: { value: [-1, -1] },
					uVelo: { value: [0, 0] },
					uScrollVelo: { value: 0 },
					uAmount: { value: 0 },
				},
			});
			const mesh = new Mesh(this.gl, { geometry: this.geometry, program });
			mesh.setParent(this.scene);
			// Hidden until the texture loads so a blank plane never flashes over the
			// still-visible DOM image.
			mesh.visible = false;

			const plane = {
				img,
				mesh,
				program,
				texture,
				lastX: null,
				lastY: null,
				vx: 0,
				vy: 0,
			};

			const source = new Image();
			source.crossOrigin = 'anonymous';
			source.decoding = 'async';
			source.onload = () => {
				texture.image = source;
				mesh.visible = true;
				// Hand the visual over to the GL plane; neutralise any resting CSS
				// transform so the rect we sync to is the clean layout box.
				img.style.opacity = '0';
				img.style.transform = 'none';
				img.style.transition = 'none';
			};
			source.src = this.textureSrc(img);

			this.planes.push(plane);
		});

		this._onResize();
		this._resizeObserver = new ResizeObserver(() => this._onResize());
		this._resizeObserver.observe(this.container);

		this._onPointerMove = (e) => {
			const rect = this.canvas.getBoundingClientRect();
			this.mouse.x = e.clientX - rect.left;
			this.mouse.y = e.clientY - rect.top;
		};
		this._onPointerLeave = () => {
			this.mouse.x = -1;
			this.mouse.y = -1;
		};
		this.container.addEventListener('pointermove', this._onPointerMove);
		this.container.addEventListener('pointerleave', this._onPointerLeave);

		this._loop = this._loop.bind(this);
		this.raf = requestAnimationFrame(this._loop);
	}

	_onResize() {
		if (!this.renderer) return;
		const rect = this.container.getBoundingClientRect();
		this.width = rect.width;
		this.height = rect.height;
		this.renderer.setSize(this.width, this.height);
	}

	_loop() {
		if (this.disposed) return;
		this.amount += 0.016;

		const canvasRect = this.canvas.getBoundingClientRect();

		for (const plane of this.planes) {
			const r = plane.img.getBoundingClientRect();
			const x = r.left - canvasRect.left;
			const y = r.top - canvasRect.top;
			const u = plane.program.uniforms;

			// Velocity from frame-to-frame movement, expressed in uv (0..1) units.
			const cx = x + r.width / 2;
			const cy = y + r.height / 2;
			let tvx = 0;
			let tvy = 0;
			if (plane.lastX !== null && r.width > 0 && r.height > 0) {
				tvx = ((cx - plane.lastX) / r.width) * this.velGain;
				tvy = ((cy - plane.lastY) / r.height) * this.velGain;
			}
			plane.lastX = cx;
			plane.lastY = cy;
			plane.vx += (tvx - plane.vx) * this.velEase;
			plane.vy += (tvy - plane.vy) * this.velEase;

			// Hover: pointer's uv within this plane, else off-screen so circle() = 0.
			let mouseUv = [-1, -1];
			if (
				this.mouse.x >= x &&
				this.mouse.x <= x + r.width &&
				this.mouse.y >= y &&
				this.mouse.y <= y + r.height
			) {
				mouseUv = [(this.mouse.x - x) / r.width, 1 - (this.mouse.y - y) / r.height];
			}

			u.uRect.value = [x, y, r.width, r.height];
			u.uCanvas.value = [this.width, this.height];
			u.uResolution.value = [r.height > 0 ? r.width / r.height : 1, 1];
			u.uMouse.value = mouseUv;
			u.uVelo.value = [clamp(plane.vx, -0.3, 0.3), clamp(plane.vy, -0.3, 0.3)];
			u.uScrollVelo.value = clamp(plane.vy, -1, 1);
			u.uAmount.value = this.amount;
		}

		try {
			this.renderer.render({ scene: this.scene });
		} catch (err) {
			// eslint-disable-next-line no-console
			console.warn('ImagePlaneEffect: render failed, falling back to plain images.', err);
			this.dispose();
			return;
		}
		this.raf = requestAnimationFrame(this._loop);
	}

	dispose() {
		this.disposed = true;
		if (this.raf) cancelAnimationFrame(this.raf);
		if (this._resizeObserver) this._resizeObserver.disconnect();
		if (this.container && this._onPointerMove) {
			this.container.removeEventListener('pointermove', this._onPointerMove);
			this.container.removeEventListener('pointerleave', this._onPointerLeave);
		}
		this.planes.forEach((p) => {
			p.img.style.opacity = '';
			p.img.style.transform = '';
			p.img.style.transition = '';
		});
		if (this.canvas && this.canvas.parentNode) {
			this.canvas.parentNode.removeChild(this.canvas);
		}
		if (this.gl) {
			const ext = this.gl.getExtension('WEBGL_lose_context');
			if (ext) ext.loseContext();
		}
		this.planes = [];
	}
}
