// Reusable WebGL image-plane effect (ogl-based).
//
// Turns every matching <img> inside a container into a textured WebGL plane on
// an overlay canvas, synced to the image's live bounding rect each frame — so
// it follows whatever CSS transform is moving that image (the marquee, a
// slider, …) without being wired into that code. The fragment shader is the
// user-authored lib/fragment.glsl (mouse-circle-gated chromatic aberration by
// velocity + film grain); edit that file to tune the look.
//
// Animation model follows the Anatole Touvron reference: an eased mouse-follow
// drives the shader's circle centre (uMouse), and an eased+clamped mouse SPEED
// (plus scroll velocity) drives the aberration amount (uVelo). uAmount is time.
//
// Source <img>s are hidden (opacity 0) once the GL layer is ready and restored
// on dispose, so no-WebGL / reduced-motion callers keep the plain images. On a
// render error (e.g. a CORS-tainted texture) it disposes and the images stay.

import { Renderer, Program, Mesh, Plane, Texture, Transform } from 'ogl';
import fragment from './fragment.glsl';

// Positions each plane in clip space from its pixel rect and passes vUv through.
// A gentle scroll-velocity curve bows the plane.
const VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;

  uniform vec4 uRect;        // x, y (top-left px, relative to canvas), w, h
  uniform vec2 uCanvas;      // canvas css px
  uniform float uScrollVelo; // signed scroll velocity
  uniform vec2 uCoverScale;  // object-fit: cover uv scale (1,1 = no crop)

  varying vec2 vUv;

  void main() {
    // Cover-fit: crop the texture uv so a mismatched image ratio fills the plane
    // without stretching. Identity (1,1) when the plane matches the image.
    vUv = (uv - 0.5) * uCoverScale + 0.5;

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
		// Easing + limits, matching the reference's feel.
		this.ease = options.ease ?? 0.1;
		this.maxVelo = options.maxVelo ?? 0.05;
		// How much page-scroll velocity adds to the aberration (0 = mouse only).
		this.scrollGain = options.scrollGain ?? 0.6;
		// Where to load each plane's texture from. Cross-origin callers (WordPress
		// media) can route through a same-origin URL to avoid a CORS-tainted
		// texture. Defaults to the img's own src (fine for same-origin/local).
		this.textureSrc = options.textureSrc || ((img) => img.currentSrc || img.src);

		this.planes = [];
		// Pointer + eased state (in canvas px), plus speed/scroll accumulators.
		this.mouse = { x: 0, y: 0 };
		this.follow = { x: 0, y: 0 };
		this.prevN = { x: 0, y: 0 };
		this.targetSpeed = 0;
		this.scrollVelo = 0;
		this.lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
		this.amount = 0; // grain seed / time
		this.raf = 0;
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
			// flipY:false because the vertex already flips clip.y for the top-left
			// origin; ogl's default flipY:true would then render the image inverted.
			const texture = new Texture(this.gl, { generateMipmaps: false, flipY: false });
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
					// Aspect vector [1, h/w] so the mouse circle reads round.
					uResolution: { value: [1, 1] },
					uMouse: { value: [-1, -1] },
					uVelo: { value: 0 },
					uScrollVelo: { value: 0 },
					uAmount: { value: 0 },
					uCoverScale: { value: [1, 1] },
				},
			});
			const mesh = new Mesh(this.gl, { geometry: this.geometry, program });
			mesh.setParent(this.scene);
			// Hidden until the texture loads so a blank plane never flashes over the
			// still-visible DOM image.
			mesh.visible = false;

			const plane = { img, mesh, program, texture, mediaW: 0, mediaH: 0 };

			const source = new Image();
			source.crossOrigin = 'anonymous';
			source.decoding = 'async';
			source.onload = () => {
				texture.image = source;
				plane.mediaW = source.naturalWidth;
				plane.mediaH = source.naturalHeight;
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
		window.addEventListener('mousemove', this._onPointerMove);

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

	// Eased mouse-follow + eased/clamped mouse speed, plus eased scroll velocity
	// (the reference's getSpeed(), generalised to include scrolling).
	_updateSpeed() {
		const nx = this.width ? this.mouse.x / this.width : 0;
		const ny = this.height ? this.mouse.y / this.height : 0;

		const speed = Math.hypot(this.prevN.x - nx, this.prevN.y - ny);
		this.targetSpeed -= this.ease * (this.targetSpeed - speed);
		this.targetSpeed = clamp(this.targetSpeed, 0, this.maxVelo);

		this.follow.x -= this.ease * (this.follow.x - this.mouse.x);
		this.follow.y -= this.ease * (this.follow.y - this.mouse.y);

		this.prevN.x = nx;
		this.prevN.y = ny;

		// Scroll velocity → normalised by viewport height, eased, clamped.
		const y = window.scrollY;
		const raw = clamp(Math.abs(y - this.lastScrollY) / window.innerHeight, 0, this.maxVelo);
		this.lastScrollY = y;
		this.scrollVelo -= this.ease * (this.scrollVelo - raw);
	}

	_loop() {
		if (this.disposed) return;
		this.amount += 0.05;
		this._updateSpeed();

		const velo = clamp(this.targetSpeed + this.scrollVelo * this.scrollGain, 0, this.maxVelo);
		const canvasRect = this.canvas.getBoundingClientRect();

		for (const plane of this.planes) {
			const r = plane.img.getBoundingClientRect();
			const x = r.left - canvasRect.left;
			const y = r.top - canvasRect.top;
			const u = plane.program.uniforms;

			// Cover-fit scale (object-fit: cover) — crop the wider axis so the image
			// fills the plane without stretching. Identity for natural-aspect planes.
			let sx = 1;
			let sy = 1;
			if (plane.mediaW && plane.mediaH && r.width && r.height) {
				const mediaRatio = plane.mediaW / plane.mediaH;
				const planeRatio = r.width / r.height;
				if (mediaRatio > planeRatio) sx = planeRatio / mediaRatio;
				else sy = mediaRatio / planeRatio;
			}

			// Eased cursor in this plane's local uv (y flipped to GL space), then
			// mapped into the same cover space as vUv so the circle lens lines up.
			// Computed even outside the plane so the lens crosses plane boundaries.
			const mu = r.width ? (this.follow.x - x) / r.width : -1;
			const mv = r.height ? 1 - (this.follow.y - y) / r.height : -1;

			u.uRect.value = [x, y, r.width, r.height];
			u.uCanvas.value = [this.width, this.height];
			u.uResolution.value = [1, r.width ? r.height / r.width : 1];
			u.uCoverScale.value = [sx, sy];
			u.uMouse.value = [(mu - 0.5) * sx + 0.5, (mv - 0.5) * sy + 0.5];
			u.uVelo.value = velo;
			u.uScrollVelo.value = this.scrollVelo;
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
		if (this._onPointerMove) window.removeEventListener('mousemove', this._onPointerMove);
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
